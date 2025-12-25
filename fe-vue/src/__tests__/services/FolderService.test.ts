import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { useFolderService } from "../../application/services/FolderService";
import { FolderApi } from "../../infrastructure/api/FolderApi";

describe("FolderService", () => {
  beforeEach(() => {
    spyOn(FolderApi, "getTree").mockResolvedValue([
      {
        id: 1,
        name: "Documents",
        parentId: null,
        isFolder: true,
        createdAt: "2025-12-22T00:00:00.000Z",
        updatedAt: "2025-12-22T00:00:00.000Z",
        children: [],
      },
    ]);

    spyOn(FolderApi, "getChildren").mockResolvedValue([
      {
        id: 2,
        name: "Work",
        parentId: 1,
        isFolder: true,
        createdAt: "2025-12-22T00:00:00.000Z",
        updatedAt: "2025-12-22T00:00:00.000Z",
      },
    ]);

    spyOn(FolderApi, "search").mockResolvedValue([
      {
        id: 1,
        name: "Documents",
        parentId: null,
        isFolder: true,
        createdAt: "2025-12-22T00:00:00.000Z",
        updatedAt: "2025-12-22T00:00:00.000Z",
      },
    ]);
  });

  it("should initialize with empty state", () => {
    const service = useFolderService();
    expect(service.tree.value).toEqual([]);
    expect(service.selectedFolder.value).toBeNull();
    expect(service.isLoading.value).toBe(false);
  });

  it("should load folder tree", async () => {
    const service = useFolderService();
    await service.loadTree();
    expect(service.tree.value).toHaveLength(1);
    expect(service.tree.value[0].name).toBe("Documents");
  });

  it("should select folder", async () => {
    const service = useFolderService();
    const folder = {
      id: 1,
      name: "Documents",
      parentId: null,
      isFolder: true,
      createdAt: "2025-12-22T00:00:00.000Z",
      updatedAt: "2025-12-22T00:00:00.000Z",
    };
    await service.selectFolder(folder);
    expect(service.selectedFolder.value).toEqual(folder);
  });

  it("should search folders", async () => {
    const service = useFolderService();
    await service.search("doc");
    expect(service.searchResults.value).toHaveLength(1);
  });

  it("should clear search", () => {
    const service = useFolderService();
    service.searchQuery.value = "test";
    service.clearSearch();
    expect(service.searchQuery.value).toBe("");
    expect(service.searchResults.value).toEqual([]);
  });

  it("should handle loading state during tree load", async () => {
    const service = useFolderService();
    const loadPromise = service.loadTree();
    expect(service.isLoading.value).toBe(true);
    await loadPromise;
    expect(service.isLoading.value).toBe(false);
  });

  it("should handle error during tree load", async () => {
    spyOn(FolderApi, "getTree").mockRejectedValue(new Error("Network error"));
    const service = useFolderService();
    
    await service.loadTree();
    
    expect(service.error.value).toBeTruthy();
    expect(service.isLoading.value).toBe(false);
  });

  it("should handle empty search query", async () => {
    const service = useFolderService();
    await service.search("");
    expect(service.searchResults.value).toEqual([]);
  });

  it("should handle search with no results", async () => {
    spyOn(FolderApi, "search").mockResolvedValue([]);
    const service = useFolderService();
    
    await service.search("nonexistent");
    
    expect(service.searchResults.value).toEqual([]);
  });

  it("should handle error during search", async () => {
    spyOn(FolderApi, "search").mockRejectedValue(new Error("Search failed"));
    const service = useFolderService();
    
    await service.search("test");
    
    expect(service.error.value).toBeTruthy();
  });

  it("should load children for a folder", async () => {
    const service = useFolderService();
    await service.loadTree();
    
    const folder = service.tree.value[0];
    await service.loadChildren(folder);
    
    expect(FolderApi.getChildren).toHaveBeenCalledWith(1);
  });

  it("should handle lazy loading of children", async () => {
    const service = useFolderService();
    await service.loadTree();
    
    const folder = service.tree.value[0];
    expect(folder.children).toEqual([]);
    
    await service.loadChildren(folder);
    expect(folder.children.length).toBeGreaterThan(0);
  });

  it("should toggle folder expansion", async () => {
    const service = useFolderService();
    await service.loadTree();
    
    const folderId = 1;
    service.toggleExpanded(folderId);
    
    expect(service.expandedIds.value).toContain(folderId);
    
    service.toggleExpanded(folderId);
    expect(service.expandedIds.value).not.toContain(folderId);
  });

  it("should handle multiple folder selections", async () => {
    const service = useFolderService();
    
    const folder1 = {
      id: 1,
      name: "Documents",
      parentId: null,
      isFolder: true,
      createdAt: "2025-12-22T00:00:00.000Z",
      updatedAt: "2025-12-22T00:00:00.000Z",
    };
    
    const folder2 = {
      id: 2,
      name: "Downloads",
      parentId: null,
      isFolder: true,
      createdAt: "2025-12-22T00:00:00.000Z",
      updatedAt: "2025-12-22T00:00:00.000Z",
    };
    
    await service.selectFolder(folder1);
    expect(service.selectedFolder.value?.id).toBe(1);
    
    await service.selectFolder(folder2);
    expect(service.selectedFolder.value?.id).toBe(2);
  });

  it("should handle search with special characters", async () => {
    const service = useFolderService();
    await service.search("test@#$%");
    expect(FolderApi.search).toHaveBeenCalledWith("test@#$%");
  });

  it("should handle very long search queries", async () => {
    const service = useFolderService();
    const longQuery = "a".repeat(1000);
    await service.search(longQuery);
    expect(FolderApi.search).toHaveBeenCalledWith(longQuery);
  });

  it("should maintain expanded state across tree reloads", async () => {
    const service = useFolderService();
    await service.loadTree();
    
    service.toggleExpanded(1);
    expect(service.expandedIds.value).toContain(1);
    
    await service.loadTree();
    expect(service.expandedIds.value).toContain(1);
  });

  it("should handle concurrent search requests", async () => {
    const service = useFolderService();
    
    const search1 = service.search("query1");
    const search2 = service.search("query2");
    
    await Promise.all([search1, search2]);
    
    expect(service.searchResults.value).toBeDefined();
  });

  it("should clear error state on successful operation", async () => {
    spyOn(FolderApi, "getTree").mockRejectedValueOnce(new Error("Error"));
    const service = useFolderService();
    
    await service.loadTree();
    expect(service.error.value).toBeTruthy();
    
    spyOn(FolderApi, "getTree").mockResolvedValue([]);
    await service.loadTree();
    expect(service.error.value).toBeNull();
  });

  it("should handle empty tree response", async () => {
    spyOn(FolderApi, "getTree").mockResolvedValue([]);
    const service = useFolderService();
    
    await service.loadTree();
    
    expect(service.tree.value).toEqual([]);
    expect(service.isLoading.value).toBe(false);
  });

  it("should handle folder with no children", async () => {
    spyOn(FolderApi, "getChildren").mockResolvedValue([]);
    const service = useFolderService();
    await service.loadTree();
    
    const folder = service.tree.value[0];
    await service.loadChildren(folder);
    
    expect(folder.children).toEqual([]);
  });
});
