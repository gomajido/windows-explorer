<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFolderService, type LazyTreeNode } from "@/application/services/FolderService";
import FolderTree from "@/presentation/components/FolderTree.vue";
import ContentPanel from "@/presentation/components/ContentPanel.vue";
import SearchResults from "@/presentation/components/SearchResults.vue";
import type { Folder } from "@/domain/entities/Folder";

const {
  tree,
  selectedFolder,
  selectedFolderId,
  children,
  searchResults,
  hasMoreResults,
  isSearching,
  isLoading,
  isLoadingMore,
  error,
  loadTree,
  loadNodeChildren,
  selectFolder,
  search,
  loadMoreResults,
  clearSearch,
} = useFolderService();

const searchInput = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSelectFolder(folder: LazyTreeNode) {
  clearSearch();
  searchInput.value = "";
  selectFolder(folder);
}

function handleExpandNode(node: LazyTreeNode) {
  loadNodeChildren(node);
}

function handleOpenFolder(folder: Folder) {
  selectFolder(folder);
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search(searchInput.value);
  }, 300);
}

function handleClearSearch() {
  searchInput.value = "";
  clearSearch();
}

function handleSearchResultClick(item: Folder) {
  searchInput.value = "";
  clearSearch();
  if (item.isFolder) {
    selectFolder(item);
  }
}

onMounted(() => {
  loadTree();
});
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
      <h1 class="text-lg font-semibold text-gray-800">Folder Explorer</h1>
      <div class="flex-1 max-w-md relative">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search folders and files..."
          class="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="handleSearch"
        />
        <button
          v-if="searchInput"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="handleClearSearch"
        >
          ✕
        </button>
      </div>
    </header>

    <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm border-b border-red-200">
      {{ error }}
    </div>

    <div class="flex-1 flex overflow-hidden">
      <FolderTree
        class="w-64 flex-shrink-0"
        :tree="tree"
        :selected-id="selectedFolderId"
        :is-loading="isLoading"
        @select="handleSelectFolder"
        @expand="handleExpandNode"
      />

      <SearchResults
        v-if="isSearching"
        :results="searchResults"
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="hasMoreResults"
        @select="handleSearchResultClick"
        @load-more="loadMoreResults"
      />

      <ContentPanel
        v-else
        class="flex-1"
        :selected-folder="selectedFolder"
        :children="children"
        :is-loading="isLoading"
        @open-folder="handleOpenFolder"
      />
    </div>
  </div>
</template>
