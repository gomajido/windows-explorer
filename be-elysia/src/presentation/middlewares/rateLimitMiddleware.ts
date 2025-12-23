import { Elysia } from "elysia";
import { ENV } from "../../infrastructure/config";

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Error message
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();

  constructor(private config: RateLimitConfig) {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.requests.get(key);

    // First request or expired window
    if (!entry || now > entry.resetAt) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    // Within window
    if (entry.count < this.config.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    }

    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Rate limit middleware for Elysia
 * 
 * Usage:
 * ```typescript
 * app.use(rateLimitMiddleware({ windowMs: 60000, maxRequests: 100 }))
 * ```
 */
export const rateLimitMiddleware = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig: RateLimitConfig = {
    windowMs: config.windowMs ?? 60000,        // 1 minute default
    maxRequests: config.maxRequests ?? 100,    // 100 requests per minute
    message: config.message ?? "Too many requests, please try again later",
  };

  const limiter = new RateLimiter(finalConfig);

  const logger = {
    debug: (...args: unknown[]) => {
      if (ENV.isDevelopment) {
        console.log("[RateLimit]", ...args);
      }
    },
  };

  return new Elysia({ name: "rate-limit" })
    .derive(({ request, set }) => {
      // Use IP or forwarded IP as key
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

      const result = limiter.isAllowed(ip);

      // Set rate limit headers
      set.headers["X-RateLimit-Limit"] = String(finalConfig.maxRequests);
      set.headers["X-RateLimit-Remaining"] = String(result.remaining);
      set.headers["X-RateLimit-Reset"] = String(Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        logger.debug(`Rate limited: ${ip}`);
        set.status = 429;
        return {
          success: false,
          error: finalConfig.message,
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        };
      }

      return {};
    });
};

// Pre-configured rate limiters for different use cases
export const apiRateLimit = rateLimitMiddleware({
  windowMs: 60000,    // 1 minute
  maxRequests: 100,   // 100 requests per minute
});

export const strictRateLimit = rateLimitMiddleware({
  windowMs: 60000,    // 1 minute
  maxRequests: 20,    // 20 requests per minute (for sensitive endpoints)
});
