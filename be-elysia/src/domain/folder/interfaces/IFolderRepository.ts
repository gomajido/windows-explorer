import type { Folder, FolderTreeNode, PaginatedResult, FindAllOptions, CursorPaginatedResult, SearchOptions } from "../entities/Folder";

/**
 * Read-only operations for folder queries.
 * Use this interface when you only need to read folder data.
 */
export interface IFolderReadRepository {
  findById(id: number, includeDeleted?: boolean): Promise<Folder | null>;
  findByParentId(parentId: number | null): Promise<Folder[]>;
  findAll(options?: FindAllOptions): Promise<PaginatedResult<Folder>>;
  count(includeDeleted?: boolean): Promise<number>;
}

/**
 * Tree-specific operations (heavy operations, often cached).
 * Segregated because tree operations have different performance characteristics.
 */
export interface IFolderTreeRepository {
  getFolderTree(): Promise<FolderTreeNode[]>;
}

/**
 * Search operations (may have different scaling needs).
 * Segregated to allow different implementations (e.g., Elasticsearch).
 */
export interface IFolderSearchRepository {
  search(query: string, limit?: number): Promise<Folder[]>;
  searchWithCursor(options: SearchOptions): Promise<CursorPaginatedResult<Folder>>;
}

/**
 * Write operations for folder mutations.
 * Segregated to support CQRS pattern if needed.
 */
export interface IFolderWriteRepository {
  create(name: string, parentId: number | null, isFolder: boolean): Promise<Folder>;
  update(id: number, name: string): Promise<Folder>;
}

/**
 * Delete operations (soft & hard delete).
 * Segregated because delete operations require special permissions.
 */
export interface IFolderDeleteRepository {
  delete(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
  restore(id: number): Promise<Folder>;
}

/**
 * Combined interface for full repository implementation.
 * Use this only when you need ALL operations (e.g., in the concrete repository class).
 * For use cases, prefer the specific interfaces above.
 */
export interface IFolderRepository extends 
  IFolderReadRepository,
  IFolderTreeRepository,
  IFolderSearchRepository,
  IFolderWriteRepository,
  IFolderDeleteRepository {}
