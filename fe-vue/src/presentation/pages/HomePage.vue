<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFolderService, type LazyTreeNode } from "@/application/services/FolderService";
import FolderTree from "@/presentation/components/FolderTree.vue";
import ContentPanel from "@/presentation/components/ContentPanel.vue";
import SearchResults from "@/presentation/components/SearchResults.vue";
import Icon from "@/presentation/components/icons/Icon.vue";
import type { Folder } from "@/domain/entities/Folder";

const {
  tree,
  selectedFolder,
  selectedFolderId,
  expandedIds,
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
  toggleExpanded,
  search,
  loadMoreResults,
  clearSearch,
} = useFolderService();

const searchInput = ref("");
const viewMode = ref<"grid" | "list">("list");
const breadcrumbs = ref<Folder[]>([]);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function toggleViewMode() {
  viewMode.value = viewMode.value === "list" ? "grid" : "list";
}

function updateBreadcrumbs(folder: Folder | null) {
  if (!folder) {
    breadcrumbs.value = [];
    return;
  }
  // For now, just show current folder. In real app, build path from parent chain
  breadcrumbs.value = [folder];
}

function navigateToRoot() {
  selectedFolder.value = null;
  breadcrumbs.value = [];
}

function handleSelectFolder(folder: LazyTreeNode) {
  clearSearch();
  searchInput.value = "";
  selectFolder(folder);
  updateBreadcrumbs(folder);
}

function handleExpandNode(node: LazyTreeNode) {
  loadNodeChildren(node);
}

function handleToggleExpand(folderId: number) {
  toggleExpanded(folderId);
}

function handleOpenFolder(folder: Folder) {
  selectFolder(folder);
  updateBreadcrumbs(folder);
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
  <div class="h-screen flex flex-col bg-gray-100" role="application" aria-label="File Explorer">
    <!-- Modern Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm" role="banner">
      <div class="px-4 py-3 flex items-center gap-4">
        <!-- Logo & Title -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="folder" size="md" class="text-white" />
          </div>
          <h1 class="text-lg font-semibold text-gray-800">File Explorer</h1>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-lg relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="search" size="sm" />
          </div>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search files and folders..."
            class="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            aria-label="Search files and folders"
            role="searchbox"
            @input="handleSearch"
            @keydown.escape="handleClearSearch"
          />
          <button
            v-if="searchInput"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleClearSearch"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        <!-- View Toggle & Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="toggleViewMode"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
            :aria-label="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
            :aria-pressed="viewMode === 'grid'"
          >
            <Icon :name="viewMode === 'list' ? 'grid' : 'list'" size="md" class="text-gray-600" />
          </button>
          <button
            @click="loadTree"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Refresh"
            aria-label="Refresh folder list"
          >
            <Icon name="refresh" size="md" class="text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Breadcrumb Navigation -->
      <nav class="px-4 py-2 flex items-center gap-1 text-sm border-t border-gray-100 bg-gray-50" aria-label="Breadcrumb">
        <button
          @click="navigateToRoot"
          class="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors text-gray-600"
        >
          <Icon name="home" size="sm" />
          <span>Home</span>
        </button>
        <template v-if="breadcrumbs.length > 0">
          <span class="text-gray-400">/</span>
          <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id" class="flex items-center gap-1">
            <button class="px-2 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700 font-medium">
              {{ crumb.name }}
            </button>
            <span v-if="index < breadcrumbs.length - 1" class="text-gray-400">/</span>
          </span>
        </template>
      </nav>
    </header>

    <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm border-b border-red-200">
      {{ error }}
    </div>

    <div class="flex-1 flex overflow-hidden">
      <FolderTree
        class="w-64 flex-shrink-0"
        :tree="tree"
        :selected-id="selectedFolderId"
        :expanded-ids="expandedIds"
        :is-loading="isLoading"
        @select="handleSelectFolder"
        @expand="handleExpandNode"
        @toggle="handleToggleExpand"
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
        :view-mode="viewMode"
        @open-folder="handleOpenFolder"
      />
    </div>
  </div>
</template>
