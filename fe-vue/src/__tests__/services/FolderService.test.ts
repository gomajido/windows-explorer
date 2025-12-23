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
});
