import type { IFolderTreeRepository } from "../../../domain/folder/interfaces";
import type { ICache } from "../../../domain/shared/interfaces/ICache";
import type { FolderTreeNode } from "../../../domain/folder/entities/Folder";

/**
 * Decorator that adds caching to any IFolderTreeRepository implementation.
 * Follows Open/Closed Principle - extends behavior without modifying the original class.
 * 
 * Benefits:
 * - Can wrap any tree repository implementation
 * - Easy to test (can inject mock cache)
 * - Can be enabled/disabled without changing repository code
 * - Supports different cache strategies by swapping ICache implementation
 */
export class CachedFolderTreeRepository implements IFolderTreeRepository {
  private static readonly CACHE_KEY = "folder:tree";
  private static readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly inner: IFolderTreeRepository,
    private readonly cache: ICache
  ) {}

  async getFolderTree(): Promise<FolderTreeNode[]> {
    return this.cache.getOrSet(
      CachedFolderTreeRepository.CACHE_KEY,
      () => this.inner.getFolderTree(),
      CachedFolderTreeRepository.CACHE_TTL
    );
  }

  /**
   * Invalidate the cache (useful after write operations)
   */
  async invalidateCache(): Promise<void> {
    await this.cache.delete(CachedFolderTreeRepository.CACHE_KEY);
  }
}
