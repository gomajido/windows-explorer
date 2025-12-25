import { ref, computed } from 'vue';
import { useFolderTree, useFolderChildren, useCreateFolder, useUpdateFolder, useDeleteFolder } from '@/composables/useFolderQueries';
import { FolderApi } from '@/infrastructure/api/FolderApi';
import type { Folder } from '@/domain/entities/Folder';
import type { LazyTreeNode } from '@/application/services/FolderService';

/**
 * Enhanced Folder Service with TanStack Query caching
 * Combines reactive state management with automatic query caching
 */
export function useFolderServiceWithCache() {
  // State management (kept from original service)
  const selectedFolder = ref<Folder | null>(null);
  const expandedIds = ref<Set<number>>(new Set());
  const searchQuery = ref("");
  const searchResults = ref<Folder[]>([]);
  const searchCursor = ref<string | null>(null);
  const hasMoreResults = ref(false);
  const isSearching = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const selectedFolderId = computed(() => selectedFolder.value?.id ?? null);
  const expandedIdsArray = computed(() => Array.from(expandedIds.value));

  // Query hooks with automatic caching
  const treeQuery = useFolderTree();
  const selectedFolderIdRef = computed(() => selectedFolder.value?.id ?? null);
  const childrenQuery = useFolderChildren(selectedFolderIdRef);
  
  // Mutation hooks with automatic cache invalidation
  const createMutation = useCreateFolder();
  const updateMutation = useUpdateFolder();
  const deleteMutation = useDeleteFolder();

  // Computed data from queries
  const tree = computed(() => {
    if (!treeQuery.data.value) return [];
    return treeQuery.data.value.map(folder => ({
      ...folder,
      children: [],
      isLoaded: false,
    } as LazyTreeNode));
  });

  const children = computed(() => childrenQuery.data.value || []);
  const isLoading = computed(() => treeQuery.isLoading.value || childrenQuery.isLoading.value);

  /**
   * Load tree - now cached automatically
   */
  async function loadTree() {
    await treeQuery.refetch();
  }

  /**
   * Load node children - uses API directly for tree expansion
   * Uses getTreeChildren to filter out files (only shows folders in tree)
   */
  async function loadNodeChildren(node: LazyTreeNode) {
    if (node.isLoaded) return;
    
    try {
      const childFolders = await FolderApi.getTreeChildren(node.id);
      node.children = childFolders.map(folder => ({
        ...folder,
        children: [],
        isLoaded: false,
      }));
      node.isLoaded = true;
      expandedIds.value.add(node.id);
      expandedIds.value = new Set(expandedIds.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load children";
    }
  }

  /**
   * Select folder - triggers cached children query automatically
   */
  async function selectFolder(folder: Folder | null) {
    selectedFolder.value = folder;
    // Children query will automatically fetch/cache based on selectedFolderId
  }

  /**
   * Toggle folder expansion
   */
  function toggleExpanded(folderId: number) {
    if (expandedIds.value.has(folderId)) {
      expandedIds.value.delete(folderId);
    } else {
      expandedIds.value.add(folderId);
    }
    expandedIds.value = new Set(expandedIds.value);
  }

  /**
   * Expand folder
   */
  function expandFolder(folderId: number) {
    if (!expandedIds.value.has(folderId)) {
      expandedIds.value.add(folderId);
      expandedIds.value = new Set(expandedIds.value);
    }
  }

  /**
   * Create folder - uses mutation with automatic cache invalidation
   */
  async function createFolder(name: string, parentId: number | null) {
    try {
      await createMutation.mutateAsync({ name, parentId, isFolder: true });
      // Cache automatically invalidated and refetched
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create folder";
      throw err;
    }
  }

  /**
   * Update folder - uses mutation with automatic cache invalidation
   */
  async function renameFolder(id: number, name: string) {
    try {
      await updateMutation.mutateAsync({ id, name });
      // Cache automatically invalidated and refetched
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to rename folder";
      throw err;
    }
  }

  /**
   * Delete folder - uses mutation with automatic cache invalidation
   */
  async function deleteFolder(id: number) {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedFolder.value?.id === id) {
        selectedFolder.value = null;
      }
      // Cache automatically invalidated and refetched
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete folder";
      throw err;
    }
  }

  /**
   * Search - still uses manual API calls
   * TODO: Could be enhanced with query hooks later
   */
  async function search(query: string) {
    isSearching.value = true;
    error.value = null;
    searchQuery.value = query;
    
    if (!query.trim()) {
      clearSearch();
      return;
    }

    try {
      const result = await FolderApi.searchWithCursor(query, 20);
      searchResults.value = result.data;
      searchCursor.value = result.cursor.next;
      hasMoreResults.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Search failed";
    }
  }

  /**
   * Load more search results
   */
  async function loadMoreResults() {
    if (!hasMoreResults.value || isLoadingMore.value) return;
    
    isLoadingMore.value = true;
    try {
      const result = await FolderApi.searchWithCursor(
        searchQuery.value,
        20,
        searchCursor.value || undefined
      );
      searchResults.value = [...searchResults.value, ...result.data];
      searchCursor.value = result.cursor.next;
      hasMoreResults.value = result.cursor.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Load more failed";
    } finally {
      isLoadingMore.value = false;
    }
  }

  /**
   * Clear search
   */
  function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
    searchCursor.value = null;
    hasMoreResults.value = false;
    isSearching.value = false;
  }

  /**
   * Load more children (for pagination)
   */
  async function loadMoreChildren() {
    // This would need cursor pagination implementation
    // For now, children are loaded fully
    console.warn('loadMoreChildren: Pagination not yet implemented for children');
  }

  const hasMoreChildren = ref(false);

  // Initialize
  loadTree();

  return {
    // State
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
    
    // Query states (for debugging/info)
    treeQuery,
    childrenQuery,
    
    // Actions
    loadTree,
    loadNodeChildren,
    selectFolder,
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
