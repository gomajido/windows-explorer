import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { FolderApi } from '@/infrastructure/api/FolderApi';

/**
 * Query hook for folder tree (root folders)
 * Cache key: ['folders', 'tree']
 * Stale time: 5 minutes (tree rarely changes)
 */
export function useFolderTree() {
  return useQuery({
    queryKey: ['folders', 'tree'],
    queryFn: () => FolderApi.getRootFolders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Query hook for folder children
 * Cache key: ['folders', 'children', parentId]
 * Stale time: 1 minute
 */
export function useFolderChildren(parentId: Ref<number | null>) {
  return useQuery({
    queryKey: ['folders', 'children', parentId],
    queryFn: () => FolderApi.getChildren(parentId.value),
    enabled: computed(() => parentId.value !== null),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Query hook for folder children with cursor pagination
 * Cache key: ['folders', 'children', 'cursor', parentId, cursor]
 * Stale time: 1 minute
 */
export function useFolderChildrenCursor(
  parentId: Ref<number | null>,
  options: Ref<{ limit?: number; cursor?: string }>
) {
  return useQuery({
    queryKey: ['folders', 'children', 'cursor', parentId, options],
    queryFn: () => FolderApi.getChildrenWithCursor(parentId.value, options.value),
    enabled: computed(() => parentId.value !== null),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Query hook for search
 * Cache key: ['folders', 'search', query]
 * Stale time: 30 seconds (search results change more frequently)
 */
export function useFolderSearch(query: Ref<string>) {
  return useQuery({
    queryKey: ['folders', 'search', query],
    queryFn: () => FolderApi.search(query.value),
    enabled: computed(() => query.value.length > 0),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Query hook for search with cursor pagination
 * Cache key: ['folders', 'search', 'cursor', query, cursor]
 */
export function useFolderSearchCursor(
  query: Ref<string>,
  options: Ref<{ limit?: number; cursor?: string }>
) {
  return useQuery({
    queryKey: ['folders', 'search', 'cursor', query, options],
    queryFn: () => FolderApi.searchWithCursor(query.value, options.value.limit, options.value.cursor),
    enabled: computed(() => query.value.length > 0),
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation hook for creating folders
 * Automatically invalidates tree and children queries on success
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; parentId: number | null; isFolder?: boolean }) =>
      FolderApi.createFolder(data.name, data.parentId, data.isFolder),
    onSuccess: () => {
      // Invalidate all folder queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

/**
 * Mutation hook for updating folders
 * Automatically invalidates affected queries on success
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      FolderApi.updateFolder(data.id, data.name),
    onSuccess: () => {
      // Invalidate all queries (name change affects search and tree)
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

/**
 * Mutation hook for deleting folders
 * Automatically invalidates all queries on success
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FolderApi.deleteFolder(id),
    onSuccess: () => {
      // Invalidate everything (structure changed)
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}
