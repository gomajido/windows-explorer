<script setup lang="ts">
import type { Folder } from "@/domain/entities/Folder";
import { getFileIcon, getFileColor } from "@/presentation/components/icons/index";
import SkeletonLoader from "./SkeletonLoader.vue";

const props = defineProps<{
  selectedFolder: Folder | null;
  children: Folder[];
  isLoading: boolean;
  viewMode?: "grid" | "list";
  hasMore?: boolean;
  isLoadingMore?: boolean;
}>();

const emit = defineEmits<{
  openFolder: [folder: Folder];
  loadMore: [];
}>();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getIconHtml(item: Folder): string {
  return getFileIcon(item.name, item.isFolder);
}

function getIconColor(item: Folder): string {
  return getFileColor(item.name, item.isFolder);
}
</script>

<template>
  <main class="content-panel h-full overflow-auto bg-white" role="main" aria-label="Folder contents">
    <!-- Empty State - No folder selected -->
    <div v-if="!selectedFolder" class="flex items-center justify-center h-full text-gray-400">
      <div class="text-center">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">No folder selected</h3>
        <p class="text-sm text-gray-400">Select a folder from the sidebar to view its contents</p>
      </div>
    </div>
    
    <!-- Loading State with Skeleton -->
    <SkeletonLoader v-else-if="isLoading" :type="props.viewMode === 'grid' ? 'grid' : 'list'" :count="8" />
    
    <!-- Empty Folder State -->
    <div v-else-if="children.length === 0" class="flex items-center justify-center h-full text-gray-400">
      <div class="text-center">
        <div class="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6" />
          </svg>
        </div>
        <h3 class="text-base font-medium text-gray-600 mb-1">This folder is empty</h3>
        <p class="text-sm text-gray-400">No files or folders to display</p>
      </div>
    </div>
    
    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="p-4" role="grid" aria-label="Files and folders grid">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="item in children"
          :key="item.id"
          class="group p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          role="gridcell"
          tabindex="0"
          :aria-label="`${item.name}, ${item.isFolder ? 'folder' : 'file'}`"
          @dblclick="item.isFolder && emit('openFolder', item)"
          @keydown.enter="item.isFolder && emit('openFolder', item)"
        >
          <div 
            class="w-12 h-12 mx-auto mb-2 flex items-center justify-center"
            :class="getIconColor(item)"
            v-html="getIconHtml(item)"
          />
          <p class="text-sm text-gray-700 truncate group-hover:text-gray-900">{{ item.name }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ item.isFolder ? 'Folder' : 'File' }}</p>
        </div>
      </div>
    </div>
    
    <!-- List View (Default) -->
    <div v-else class="h-full flex flex-col">
      <div class="flex-shrink-0 text-left text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
        <div class="flex px-4 py-3 font-medium">
          <div class="flex-1">Name</div>
          <div class="w-24">Type</div>
          <div class="w-32">Modified</div>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="item in children"
          :key="item.id"
          class="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-100"
          role="row"
          tabindex="0"
          :aria-label="`${item.name}, ${item.isFolder ? 'folder' : 'file'}`"
          @dblclick="item.isFolder && emit('openFolder', item)"
          @keydown.enter="item.isFolder && emit('openFolder', item)"
        >
          <div class="flex-1 flex items-center gap-3">
            <span 
              class="w-5 h-5 flex-shrink-0"
              :class="getIconColor(item)"
              v-html="getIconHtml(item)"
            />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ item.name }}</span>
          </div>
          <div class="w-24 text-sm text-gray-500">
            {{ item.isFolder ? "Folder" : "File" }}
          </div>
          <div class="w-32 text-sm text-gray-500">
            {{ formatDate(item.updatedAt) }}
          </div>
        </div>
      </div>

      <!-- Load More Button with helpful instructions -->
      <div v-if="hasMore" class="flex-shrink-0 p-4 text-center border-t border-gray-200 bg-gray-50">
        <p class="text-xs text-gray-500 mb-2">
          📄 More items available
        </p>
        <button
          @click="emit('loadMore')"
          :disabled="isLoadingMore"
          class="px-6 py-2.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <span v-if="isLoadingMore" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            Load More Items
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
        <p class="text-xs text-gray-400 mt-2">
          💡 Scroll down to see the button
        </p>
      </div>
    </div>
  </main>
</template>
