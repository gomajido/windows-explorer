import type { Folder, FolderTreeNode, PaginatedResult, FindAllOptions, CursorPaginatedResult, SearchOptions } from "../entities/Folder";

export interface IFolderRepository {
  // Read operations
  findAll(options?: FindAllOptions): Promise<PaginatedResult<Folder>>;
  findById(id: number, includeDeleted?: boolean): Promise<Folder | null>;
  findByParentId(parentId: number | null): Promise<Folder[]>;
  getFolderTree(): Promise<FolderTreeNode[]>;
  search(query: string, limit?: number): Promise<Folder[]>;
  searchWithCursor(options: SearchOptions): Promise<CursorPaginatedResult<Folder>>;
  count(includeDeleted?: boolean): Promise<number>;

  // Write operations
  create(name: string, parentId: number | null, isFolder: boolean): Promise<Folder>;
  update(id: number, name: string): Promise<Folder>;

  // Delete operations (soft delete by default)
  delete(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
  restore(id: number): Promise<Folder>;
}
