<script setup lang="ts">
import type { Folder } from "@/domain/entities/Folder";

interface Props {
  results: Folder[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
}

interface Emits {
  (e: "select", item: Folder): void;
  (e: "loadMore"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleSelect(item: Folder) {
  emit("select", item);
}

function handleLoadMore() {
  emit("loadMore");
}
</script>

<template>
  <div class="flex-1 bg-white overflow-auto">
    <div class="p-3 border-b border-gray-200 bg-gray-50">
      <h2 class="text-sm font-semibold text-gray-700">
        Search Results ({{ results.length }})
      </h2>
    </div>

    <div v-if="isLoading && results.length === 0" class="p-4 text-center text-gray-400">
      <span class="text-sm">Loading...</span>
    </div>

    <div v-else-if="results.length === 0" class="p-4 text-center text-gray-400">
      <span class="text-sm">No results found</span>
    </div>

    <div v-else class="p-2">
      <div
        v-for="item in results"
        :key="item.id"
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
        @click="handleSelect(item)"
      >
        <span class="text-lg">{{ item.isFolder ? '📁' : '📄' }}</span>
        <span class="text-sm">{{ item.name }}</span>
        <span class="text-xs text-gray-400 ml-auto">
          {{ item.isFolder ? 'Folder' : 'File' }}
        </span>
      </div>

      <!-- Load More Button with helpful instructions -->
      <div v-if="hasMore" class="p-4 text-center border-t border-gray-200 bg-gray-50">
        <p class="text-xs text-gray-500 mb-2">
          🔍 More results found
        </p>
        <button
          @click="handleLoadMore"
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
            Load More Results
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
  </div>
</template>
