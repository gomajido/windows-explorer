export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  isFolder: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  hasChildren?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

/**
 * Cursor-based pagination result for scalable queries.
 * More efficient than offset pagination for large datasets.
 */
export interface CursorPaginatedResult<T> {
  data: T[];
  cursor: {
    next: string | null;  // Encoded cursor for next page
    hasMore: boolean;
  };
}

export interface SearchOptions {
  query: string;
  limit?: number;
  cursor?: string;  // Base64 encoded cursor (last item ID)
}
