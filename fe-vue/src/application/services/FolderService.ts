import { ref, computed } from "vue";
import type { Folder, FolderTreeNode } from "@/domain/entities/Folder";
import { FolderApi } from "@/infrastructure/api/FolderApi";
import { useErrorHandler } from "@/application/composables/useErrorHandler";

// Extended tree node with loading state for lazy loading
export interface LazyTreeNode extends FolderTreeNode {
  isLoaded?: boolean;
  isExpanding?: boolean;
}

export function useFolderService() {
  const { handleApiError } = useErrorHandler();
  
  const tree = ref<LazyTreeNode[]>([]);
  const selectedFolder = ref<Folder | null>(null);
  const children = ref<Folder[]>([]);
  const searchResults = ref<Folder[]>([]);
  const searchQuery = ref("");
  const searchCursor = ref<string | null>(null);
  const hasMoreResults = ref(false);
  const isSearching = ref(false);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  const selectedFolderId = computed(() => selectedFolder.value?.id ?? null);

  /**
   * Load root folders only (lazy tree - scalable)
   */
  async function loadTree() {
    isLoading.value = true;
    error.value = null;
    try {
      const rootFolders = await FolderApi.getRootFolders();
      // Convert to lazy tree nodes (only folders, not files)
      tree.value = rootFolders
        .filter(f => f.isFolder)
        .map(folder => ({
          ...folder,
          children: [],
          isLoaded: false,
          isExpanding: false,
        }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load tree";
      handleApiError(err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load children for a tree node (lazy loading on expand)
   */
  async function loadNodeChildren(node: LazyTreeNode): Promise<void> {
    if (node.isLoaded || node.isExpanding) return;
    
    node.isExpanding = true;
    try {
      const childFolders = await FolderApi.getChildren(node.id);
      // Only add folders to tree (not files)
      node.children = childFolders
        .filter(f => f.isFolder)
        .map(folder => ({
          ...folder,
          children: [],
          isLoaded: false,
          isExpanding: false,
        }));
      node.isLoaded = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load children";
    } finally {
      node.isExpanding = false;
    }
  }

  async function selectFolder(folder: Folder | null) {
    selectedFolder.value = folder;
    if (folder) {
      await loadChildren(folder.id);
    } else {
      children.value = [];
    }
  }

  async function loadChildren(parentId: number | null) {
    isLoading.value = true;
    error.value = null;
    try {
      children.value = await FolderApi.getChildren(parentId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load children";
    } finally {
      isLoading.value = false;
    }
  }

  async function createFolder(name: string, parentId: number | null) {
    try {
      await FolderApi.createFolder(name, parentId, true);
      await loadTree();
      if (selectedFolder.value?.id === parentId) {
        await loadChildren(parentId);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create folder";
    }
  }

  async function deleteFolder(id: number) {
    try {
      await FolderApi.deleteFolder(id);
      await loadTree();
      if (selectedFolder.value?.id === id) {
        selectedFolder.value = null;
        children.value = [];
      } else if (selectedFolder.value) {
        await loadChildren(selectedFolder.value.id);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete folder";
    }
  }

  async function renameFolder(id: number, name: string) {
    try {
      await FolderApi.updateFolder(id, name);
      await loadTree();
      if (selectedFolder.value) {
        await loadChildren(selectedFolder.value.id);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to rename folder";
    }
  }

  async function search(query: string) {
    searchQuery.value = query;
    searchCursor.value = null;
    hasMoreResults.value = false;
    
    if (!query.trim()) {
      searchResults.value = [];
      isSearching.value = false;
      return;
    }
    isSearching.value = true;
    isLoading.value = true;
    error.value = null;
    try {
      const result = await FolderApi.searchWithCursor(query, 20);
      searchResults.value = result.data;
      searchCursor.value = result.cursor.next;
      hasMoreResults.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Search failed";
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMoreResults() {
    if (!searchQuery.value || !searchCursor.value || isLoadingMore.value) {
      return;
    }
    
    isLoadingMore.value = true;
    error.value = null;
    try {
      const result = await FolderApi.searchWithCursor(searchQuery.value, 20, searchCursor.value);
      searchResults.value = [...searchResults.value, ...result.data];
      searchCursor.value = result.cursor.next;
      hasMoreResults.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Load more failed";
    } finally {
      isLoadingMore.value = false;
    }
  }

  function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
    searchCursor.value = null;
    hasMoreResults.value = false;
    isSearching.value = false;
  }

  return {
    tree,
    selectedFolder,
    selectedFolderId,
    children,
    searchResults,
    searchQuery,
    hasMoreResults,
    isSearching,
    isLoading,
    isLoadingMore,
    error,
    loadTree,
    loadNodeChildren,
    selectFolder,
    loadChildren,
    createFolder,
    deleteFolder,
    renameFolder,
    search,
    loadMoreResults,
    clearSearch,
  };
}
