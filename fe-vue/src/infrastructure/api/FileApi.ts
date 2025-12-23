import type { FileItem, DirectoryContent } from "@/domain/entities/FileItem";

const API_BASE = "/api";

export const FileApi = {
  async listDirectory(path: string = "/"): Promise<DirectoryContent> {
    const response = await fetch(`${API_BASE}/files?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error("Failed to list directory");
    return response.json();
  },

  async getFileInfo(path: string): Promise<FileItem> {
    const response = await fetch(`${API_BASE}/files/info?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error("Failed to get file info");
    return response.json();
  },

  async createFolder(path: string, name: string): Promise<FileItem> {
    const response = await fetch(`${API_BASE}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, name }),
    });
    if (!response.ok) throw new Error("Failed to create folder");
    return response.json();
  },

  async deleteItem(path: string): Promise<void> {
    const response = await fetch(`${API_BASE}/files?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
  },

  async renameItem(path: string, newName: string): Promise<FileItem> {
    const response = await fetch(`${API_BASE}/files/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, newName }),
    });
    if (!response.ok) throw new Error("Failed to rename item");
    return response.json();
  },
};
