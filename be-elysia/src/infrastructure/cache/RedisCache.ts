import Redis from "ioredis";
import { ENV } from "../config";
import type { ICache } from "../../domain/shared/interfaces/ICache";

/**
 * Redis cache implementation with in-memory fallback.
 * Implements ICache interface for dependency inversion.
 */
export class RedisCache implements ICache {
  private client: Redis | null = null;
  private memoryFallback = new Map<string, { value: string; expiresAt: number }>();
  private isConnected = false;

  private readonly logger = {
    debug: (...args: unknown[]) => {
      if (ENV.isDevelopment) {
        console.log("[RedisCache]", ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error("[RedisCache]", ...args);
    },
    info: (...args: unknown[]) => {
      console.log("[RedisCache]", ...args);
    },
  };

  constructor() {
    this.connect();
  }

  /**
   * Connect to Redis
   */
  private connect(): void {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy: (times) => Math.min(times * 100, 3000),
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        this.logger.info("Connected to Redis");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        this.logger.error("Redis error:", err.message);
      });

      this.client.on("close", () => {
        this.isConnected = false;
        this.logger.info("Redis connection closed");
      });

      // Try to connect
      this.client.connect().catch((err) => {
        this.logger.error("Failed to connect to Redis, using memory fallback:", err.message);
        this.isConnected = false;
      });
    } catch (error) {
      this.logger.error("Failed to initialize Redis:", error);
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        if (value) {
          this.logger.debug(`HIT (Redis): ${key}`);
          return JSON.parse(value) as T;
        }
        this.logger.debug(`MISS (Redis): ${key}`);
        return null;
      }

      // Memory fallback
      return this.getFromMemory<T>(key);
    } catch (error) {
      this.logger.error("Get error:", error);
      return this.getFromMemory<T>(key);
    }
  }

  /**
   * Set value with TTL (seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);

    try {
      if (this.isConnected && this.client) {
        await this.client.setex(key, ttlSeconds, serialized);
        this.logger.debug(`SET (Redis): ${key} (TTL: ${ttlSeconds}s)`);
        return;
      }

      // Memory fallback
      this.setInMemory(key, serialized, ttlSeconds);
    } catch (error) {
      this.logger.error("Set error:", error);
      this.setInMemory(key, serialized, ttlSeconds);
    }
  }

  /**
   * Delete key
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        this.logger.debug(`DELETE (Redis): ${key}`);
        return;
      }

      this.memoryFallback.delete(key);
      this.logger.debug(`DELETE (Memory): ${key}`);
    } catch (error) {
      this.logger.error("Delete error:", error);
      this.memoryFallback.delete(key);
    }
  }

  /**
   * Get or set pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Check if connected to Redis
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get from memory fallback
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryFallback.get(key);
    if (!entry) {
      this.logger.debug(`MISS (Memory): ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryFallback.delete(key);
      this.logger.debug(`EXPIRED (Memory): ${key}`);
      return null;
    }

    this.logger.debug(`HIT (Memory): ${key}`);
    return JSON.parse(entry.value) as T;
  }

  /**
   * Set in memory fallback
   */
  private setInMemory(key: string, value: string, ttlSeconds: number): void {
    this.memoryFallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    this.logger.debug(`SET (Memory): ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.info("Redis disconnected");
    }
  }
}

// Singleton instance
export const cache = new RedisCache();
