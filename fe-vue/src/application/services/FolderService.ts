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
  const expandedIds = ref<Set<number>>(new Set());
  const children = ref<Folder[]>([]);
  const childrenCursor = ref<string | null>(null);
  const hasMoreChildren = ref(false);
  const searchResults = ref<Folder[]>([]);
  const searchQuery = ref("");
  const searchCursor = ref<string | null>(null);
  const hasMoreResults = ref(false);
  const isSearching = ref(false);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  const selectedFolderId = computed(() => selectedFolder.value?.id ?? null);
  const expandedIdsArray = computed(() => Array.from(expandedIds.value));

  /**
   * Load root folders only (lazy tree - scalable)
   */
  async function loadTree() {
    isLoading.value = true;
    error.value = null;
    try {
      const rootFolders = await FolderApi.getRootFolders();
      // Backend already returns only folders for tree navigation
      tree.value = rootFolders.map(folder => ({
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
      const childFolders = await FolderApi.getTreeChildren(node.id);
      // Backend already filters to folders only
      node.children = childFolders.map(folder => ({
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

  /**
   * Toggle expanded state for a folder
   */
  function toggleExpanded(folderId: number) {
    if (expandedIds.value.has(folderId)) {
      expandedIds.value.delete(folderId);
    } else {
      expandedIds.value.add(folderId);
    }
    // Trigger reactivity
    expandedIds.value = new Set(expandedIds.value);
  }

  /**
   * Expand a folder (add to expanded set)
   */
  function expandFolder(folderId: number) {
    if (!expandedIds.value.has(folderId)) {
      expandedIds.value.add(folderId);
      expandedIds.value = new Set(expandedIds.value);
    }
  }

  /**
   * Find and expand all parent folders for a given folder
   */
  function expandParentPath(folderId: number) {
    // Find the folder in the tree and expand all parents
    function findAndExpand(nodes: LazyTreeNode[], targetId: number, path: number[] = []): boolean {
      for (const node of nodes) {
        if (node.id === targetId) {
          // Found it! Expand all folders in the path
          path.forEach(id => expandedIds.value.add(id));
          expandedIds.value = new Set(expandedIds.value);
          return true;
        }
        if (node.children.length > 0) {
          if (findAndExpand(node.children, targetId, [...path, node.id])) {
            return true;
          }
        }
      }
      return false;
    }
    findAndExpand(tree.value, folderId);
  }

  async function selectFolder(folder: Folder | null) {
    selectedFolder.value = folder;
    if (folder) {
      // Expand this folder and its parents in the tree
      expandFolder(folder.id);
      expandParentPath(folder.id);
      await loadChildren(folder.id);
    } else {
      children.value = [];
    }
  }

  async function loadChildren(parentId: number | null) {
    isLoading.value = true;
    error.value = null;
    childrenCursor.value = null;
    try {
      // Use cursor pagination for initial load
      const result = await FolderApi.getChildrenWithCursor(parentId, { limit: 50 });
      children.value = result.data;
      childrenCursor.value = result.cursor.next;
      hasMoreChildren.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load children";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load more children for infinite scroll (append to existing)
   */
  async function loadMoreChildren() {
    if (!selectedFolder.value || !hasMoreChildren.value || isLoadingMore.value) {
      return;
    }

    isLoadingMore.value = true;
    try {
      const result = await FolderApi.getChildrenWithCursor(
        selectedFolder.value.id,
        { limit: 50, cursor: childrenCursor.value || undefined }
      );
      children.value.push(...result.data);
      childrenCursor.value = result.cursor.next;
      hasMoreChildren.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load more children";
    } finally {
      isLoadingMore.value = false;
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
    expandedIds: expandedIdsArray,
    children,
    hasMoreChildren,
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
    loadMoreChildren,
    toggleExpanded,
    expandFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    search,
    loadMoreResults,
    clearSearch,
  };
}
