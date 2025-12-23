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

      <!-- Load More Button -->
      <div v-if="hasMore" class="p-3 text-center">
        <button
          @click="handleLoadMore"
          :disabled="isLoadingMore"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isLoadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>
