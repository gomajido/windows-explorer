import type { Folder, FolderTreeNode, ApiResponse, CursorPaginatedResult } from "@/domain/entities/Folder";

const API_BASE = "/api/v1/folders";

export const FolderApi = {
  async getTree(): Promise<FolderTreeNode[]> {
    const response = await fetch(`${API_BASE}/tree`);
    const result: ApiResponse<FolderTreeNode[]> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  /**
   * Get root folders (parentId = null) for lazy tree initial load
   */
  async getRootFolders(): Promise<Folder[]> {
    const response = await fetch(`${API_BASE}/root/children`);
    const result: ApiResponse<Folder[]> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  async getChildren(parentId: number | null): Promise<Folder[]> {
    const id = parentId === null ? "root" : parentId;
    const response = await fetch(`${API_BASE}/${id}/children`);
    const result: ApiResponse<Folder[]> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  /**
   * Get children with cursor-based pagination for infinite scroll.
   * Scales to millions of children per folder.
   */
  async getChildrenWithCursor(
    parentId: number | null,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<CursorPaginatedResult<Folder>> {
    const id = parentId === null ? "root" : parentId;
    let url = `${API_BASE}/${id}/children/cursor?limit=${options.limit || 50}`;
    if (options.cursor) {
      url += `&cursor=${encodeURIComponent(options.cursor)}`;
    }
    const response = await fetch(url);
    const result: ApiResponse<CursorPaginatedResult<Folder>> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  async getFolder(id: number): Promise<Folder> {
    const response = await fetch(`${API_BASE}/${id}`);
    const result: ApiResponse<Folder> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  async createFolder(name: string, parentId: number | null, isFolder: boolean = true): Promise<Folder> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId, isFolder }),
    });
    const result: ApiResponse<Folder> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  async updateFolder(id: number, name: string): Promise<Folder> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const result: ApiResponse<Folder> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  async deleteFolder(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const result: ApiResponse<null> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
  },

  async search(query: string): Promise<Folder[]> {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const result: ApiResponse<Folder[]> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },

  /**
   * Cursor-based search for infinite scroll.
   * More scalable than offset pagination for large datasets.
   */
  async searchWithCursor(query: string, limit: number = 20, cursor?: string): Promise<CursorPaginatedResult<Folder>> {
    let url = `${API_BASE}/search/cursor?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    const response = await fetch(url);
    const result: ApiResponse<CursorPaginatedResult<Folder>> = await response.json();
    if (result.httpCode >= 400) throw new Error(result.detail || result.message);
    return result.data;
  },
};
