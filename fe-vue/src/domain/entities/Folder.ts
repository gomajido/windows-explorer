export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  hasChildren?: boolean;
  isLoaded?: boolean;
}

export interface ApiResponse<T> {
  httpCode: number;
  message: string;
  code: string;
  data: T;
  detail?: string;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  cursor: {
    next: string | null;
    hasMore: boolean;
  };
}
