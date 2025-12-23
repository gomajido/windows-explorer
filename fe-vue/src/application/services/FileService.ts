import { ref, computed } from "vue";
import type { FileItem, DirectoryContent } from "@/domain/entities/FileItem";
import { FileApi } from "@/infrastructure/api/FileApi";

export function useFileService() {
  const currentPath = ref("/");
  const items = ref<FileItem[]>([]);
  const parentPath = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedItem = ref<FileItem | null>(null);
  const history = ref<string[]>([]);
  const historyIndex = ref(-1);

  const canGoBack = computed(() => historyIndex.value > 0);
  const canGoForward = computed(() => historyIndex.value < history.value.length - 1);
  const canGoUp = computed(() => parentPath.value !== null);

  async function loadDirectory(path: string, addToHistory = true) {
    loading.value = true;
    error.value = null;
    try {
      const data: DirectoryContent = await FileApi.listDirectory(path);
      currentPath.value = data.path;
      items.value = data.items;
      parentPath.value = data.parentPath;
      selectedItem.value = null;

      if (addToHistory) {
        history.value = history.value.slice(0, historyIndex.value + 1);
        history.value.push(path);
        historyIndex.value = history.value.length - 1;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load directory";
    } finally {
      loading.value = false;
    }
  }

  function goBack() {
    if (canGoBack.value) {
      historyIndex.value--;
      loadDirectory(history.value[historyIndex.value], false);
    }
  }

  function goForward() {
    if (canGoForward.value) {
      historyIndex.value++;
      loadDirectory(history.value[historyIndex.value], false);
    }
  }

  function goUp() {
    if (parentPath.value) {
      loadDirectory(parentPath.value);
    }
  }

  function openItem(item: FileItem) {
    if (item.isDirectory) {
      loadDirectory(item.path);
    }
  }

  function selectItem(item: FileItem | null) {
    selectedItem.value = item;
  }

  async function createFolder(name: string) {
    try {
      await FileApi.createFolder(currentPath.value, name);
      await loadDirectory(currentPath.value, false);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to create folder";
    }
  }

  async function deleteItem(item: FileItem) {
    try {
      await FileApi.deleteItem(item.path);
      await loadDirectory(currentPath.value, false);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to delete item";
    }
  }

  async function renameItem(item: FileItem, newName: string) {
    try {
      await FileApi.renameItem(item.path, newName);
      await loadDirectory(currentPath.value, false);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to rename item";
    }
  }

  return {
    currentPath,
    items,
    parentPath,
    loading,
    error,
    selectedItem,
    canGoBack,
    canGoForward,
    canGoUp,
    loadDirectory,
    goBack,
    goForward,
    goUp,
    openItem,
    selectItem,
    createFolder,
    deleteItem,
    renameItem,
  };
}
