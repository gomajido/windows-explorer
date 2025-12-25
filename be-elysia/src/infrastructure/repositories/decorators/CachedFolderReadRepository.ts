import type { IFolderReadRepository } from "../../../domain/folder/interfaces";
import type { ICache } from "../../../domain/shared/interfaces/ICache";
import type { Folder, CursorPaginatedResult, PaginatedResult, FindAllOptions } from "../../../domain/folder/entities/Folder";

/**
 * Decorator that adds caching to folder read operations.
 * Caches folder children queries to reduce database load.
 * 
 * Cache Strategy:
 * - Children queries: 5 minute TTL
 * - Cursor pages: 5 minute TTL (each page cached separately)
 * - Pattern: folder:children:{parentId}[:cursor:{cursor}]
 */
export class CachedFolderReadRepository implements IFolderReadRepository {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = "folder:children:";

  constructor(
    private readonly inner: IFolderReadRepository,
    private readonly cache: ICache
  ) {}

  /**
   * Find by ID - pass through (not frequently accessed, low cache benefit)
   */
  async findById(id: number, includeDeleted?: boolean): Promise<Folder | null> {
    return this.inner.findById(id, includeDeleted);
  }

  /**
   * Find children by parent ID - CACHED
   * Cache key: folder:children:{parentId}
   */
  async findByParentId(parentId: number | null): Promise<Folder[]> {
    const key = this.getCacheKey(parentId);
    return this.cache.getOrSet(
      key,
      () => this.inner.findByParentId(parentId),
      CachedFolderReadRepository.CACHE_TTL
    );
  }

  /**
   * Find children with cursor pagination - CACHED
   * Cache key: folder:children:{parentId}:cursor:{cursor}
   * Each page is cached separately for efficient pagination
   */
  async findByParentIdWithCursor(
    parentId: number | null,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<CursorPaginatedResult<Folder>> {
    const key = this.getCursorCacheKey(parentId, options.cursor);
    return this.cache.getOrSet(
      key,
      () => this.inner.findByParentIdWithCursor(parentId, options),
      CachedFolderReadRepository.CACHE_TTL
    );
  }

  /**
   * Find all - pass through (admin operation, not frequently used)
   */
  async findAll(options?: FindAllOptions): Promise<PaginatedResult<Folder>> {
    return this.inner.findAll(options);
  }

  /**
   * Count - pass through (not frequently used)
   */
  async count(includeDeleted?: boolean): Promise<number> {
    return this.inner.count(includeDeleted);
  }

  /**
   * Generate cache key for children query
   */
  private getCacheKey(parentId: number | null): string {
    return `${CachedFolderReadRepository.CACHE_PREFIX}${parentId ?? 'root'}`;
  }

  /**
   * Generate cache key for cursor pagination
   */
  private getCursorCacheKey(parentId: number | null, cursor?: string): string {
    const base = this.getCacheKey(parentId);
    return cursor ? `${base}:cursor:${cursor}` : `${base}:cursor:first`;
  }

  /**
   * Invalidate cache for specific parent
   */
  async invalidateParent(parentId: number | null): Promise<void> {
    const key = this.getCacheKey(parentId);
    await this.cache.delete(key);
  }

  /**
   * Invalidate all cursor pages for a parent
   * Uses pattern deletion to clear all paginated results
   */
  async invalidateParentCursors(parentId: number | null): Promise<void> {
    const pattern = `${this.getCacheKey(parentId)}:cursor:*`;
    // Note: deletePattern needs to be implemented in RedisCache
    await this.cache.delete(pattern);
  }
}
