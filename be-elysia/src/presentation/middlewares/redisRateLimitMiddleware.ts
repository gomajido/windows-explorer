import { Elysia } from "elysia";
import { cache } from "../../infrastructure/cache";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

/**
 * Redis-based rate limiter for horizontal scaling
 * Works across multiple backend instances
 * 
 * Benefits:
 * - Shared state across instances
 * - Scales to thousands of concurrent users
 * - Automatic cleanup via Redis TTL
 */
export const redisRateLimitMiddleware = (config: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 100,
}) => {
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  return new Elysia({ name: "redis-rate-limit" })
    .onBeforeHandle(async ({ request, set }) => {
      const ip = request.headers.get("x-forwarded-for") || 
                 request.headers.get("x-real-ip") || 
                 "unknown";
      
      const key = `ratelimit:${ip}`;
      
      try {
        // Get current count from Redis
        const currentStr = await cache.get(key) as string | null;
        const current = currentStr ? parseInt(currentStr, 10) : 0;

        if (current >= config.maxRequests) {
          set.status = 429;
          set.headers["Retry-After"] = String(windowSeconds);
          set.headers["X-RateLimit-Limit"] = String(config.maxRequests);
          set.headers["X-RateLimit-Remaining"] = "0";
          set.headers["X-RateLimit-Reset"] = String(Date.now() + config.windowMs);

          return {
            httpCode: 429,
            message: config.message || "Too many requests",
            code: "RATE_LIMIT_EXCEEDED",
            data: null,
          };
        }

        // Increment counter in Redis with TTL
        const newCount = current + 1;
        await cache.set(key, String(newCount), windowSeconds);

        // Set rate limit headers
        set.headers["X-RateLimit-Limit"] = String(config.maxRequests);
        set.headers["X-RateLimit-Remaining"] = String(config.maxRequests - newCount);
        set.headers["X-RateLimit-Reset"] = String(Date.now() + config.windowMs);

      } catch (error) {
        // If Redis fails, allow request (fail open)
        console.error("Rate limit check failed:", error);
      }
    });
};
