<script setup lang="ts">
defineProps<{
  type?: "list" | "grid" | "tree" | "text";
  count?: number;
}>();
</script>

<template>
  <!-- Tree Skeleton -->
  <div v-if="type === 'tree'" class="p-2 space-y-1">
    <div v-for="i in (count || 5)" :key="i" class="flex items-center gap-2 px-2 py-1.5">
      <div class="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div class="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div 
        class="h-4 bg-gray-200 rounded animate-pulse" 
        :style="{ width: `${60 + Math.random() * 80}px` }"
      />
    </div>
    <!-- Nested items -->
    <div v-for="i in 3" :key="`nested-${i}`" class="flex items-center gap-2 px-2 py-1.5 ml-6">
      <div class="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div class="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      <div 
        class="h-4 bg-gray-200 rounded animate-pulse" 
        :style="{ width: `${50 + Math.random() * 60}px` }"
      />
    </div>
  </div>

  <!-- List Skeleton -->
  <div v-else-if="type === 'list'" class="p-2">
    <div class="space-y-1">
      <div 
        v-for="i in (count || 8)" 
        :key="i" 
        class="flex items-center gap-4 px-4 py-3 border-b border-gray-100"
      >
        <div class="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div class="flex-1">
          <div 
            class="h-4 bg-gray-200 rounded animate-pulse" 
            :style="{ width: `${100 + Math.random() * 150}px` }"
          />
        </div>
        <div class="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        <div class="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>

  <!-- Grid Skeleton -->
  <div v-else-if="type === 'grid'" class="p-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div 
        v-for="i in (count || 12)" 
        :key="i" 
        class="p-3 rounded-xl text-center"
      >
        <div class="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg animate-pulse" />
        <div class="h-4 bg-gray-200 rounded animate-pulse mx-auto" style="width: 70%" />
        <div class="h-3 bg-gray-100 rounded animate-pulse mx-auto mt-1" style="width: 40%" />
      </div>
    </div>
  </div>

  <!-- Text Skeleton (default) -->
  <div v-else class="space-y-2 p-4">
    <div v-for="i in (count || 3)" :key="i" class="flex items-center gap-2">
      <div 
        class="h-4 bg-gray-200 rounded animate-pulse" 
        :style="{ width: `${80 + Math.random() * 120}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
