import type { IFolderSearchRepository } from "../../../domain/folder/interfaces";
import type { ICache } from "../../../domain/shared/interfaces/ICache";
import type { Folder, CursorPaginatedResult, SearchOptions } from "../../../domain/folder/entities/Folder";

/**
 * Decorator that adds caching to folder search operations.
 * Caches search results to reduce database load for repeated queries.
 * 
 * Cache Strategy:
 * - Search results: 3 minute TTL (shorter than children, as search results change more)
 * - Each cursor page cached separately
 * - Pattern: folder:search:{query}[:cursor:{cursor}]
 */
export class CachedFolderSearchRepository implements IFolderSearchRepository {
  private static readonly CACHE_TTL = 180; // 3 minutes
  private static readonly CACHE_PREFIX = "folder:search:";

  constructor(
    private readonly inner: IFolderSearchRepository,
    private readonly cache: ICache
  ) {}

  /**
   * Basic search - CACHED
   * Cache key: folder:search:basic:{query}
   */
  async search(query: string, limit?: number): Promise<Folder[]> {
    const sanitizedQuery = this.sanitizeQuery(query);
    const key = `${CachedFolderSearchRepository.CACHE_PREFIX}basic:${sanitizedQuery}:${limit ?? 'default'}`;
    
    return this.cache.getOrSet(
      key,
      () => this.inner.search(query, limit),
      CachedFolderSearchRepository.CACHE_TTL
    );
  }

  /**
   * Search with cursor pagination - CACHED
   * Cache key: folder:search:cursor:{query}:{cursor}
   * Each page cached separately for efficient pagination
   */
  async searchWithCursor(options: SearchOptions): Promise<CursorPaginatedResult<Folder>> {
    const sanitizedQuery = this.sanitizeQuery(options.query);
    const key = this.getCursorCacheKey(sanitizedQuery, options.cursor);
    
    return this.cache.getOrSet(
      key,
      () => this.inner.searchWithCursor(options),
      CachedFolderSearchRepository.CACHE_TTL
    );
  }

  /**
   * Sanitize query for cache key (lowercase, trim, remove special chars)
   */
  private sanitizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Generate cache key for cursor pagination
   */
  private getCursorCacheKey(sanitizedQuery: string, cursor?: string): string {
    const cursorPart = cursor ? `:cursor:${cursor}` : ':cursor:first';
    return `${CachedFolderSearchRepository.CACHE_PREFIX}cursor:${sanitizedQuery}${cursorPart}`;
  }

  /**
   * Invalidate all search caches
   * Useful when folder names change (affects search results)
   */
  async invalidateAll(): Promise<void> {
    // Note: This requires pattern deletion in RedisCache
    await this.cache.delete(`${CachedFolderSearchRepository.CACHE_PREFIX}*`);
  }
}
