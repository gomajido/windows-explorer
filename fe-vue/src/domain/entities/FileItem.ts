export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  extension: string;
  createdAt: string;
  modifiedAt: string;
}

export interface DirectoryContent {
  path: string;
  items: FileItem[];
  parentPath: string | null;
}
