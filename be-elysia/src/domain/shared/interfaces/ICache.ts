/**
 * Cache abstraction interface.
 * Allows swapping between Redis, in-memory, or other cache implementations.
 * Follows Dependency Inversion Principle.
 */
export interface ICache {
  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  /**
   * Delete value from cache
   * @param key Cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple keys matching a pattern (e.g., "folder:*")
   * @param pattern Pattern with * wildcard support
   * @returns Number of keys deleted
   */
  deletePattern(pattern: string): Promise<number>;

  /**
   * Get value from cache or fetch and cache if not found
   * @param key Cache key
   * @param fetcher Function to fetch value if not cached
   * @param ttlSeconds Time to live in seconds
   * @returns Cached or fetched value
   */
  getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T>;
}
