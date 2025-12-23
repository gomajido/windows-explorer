<script setup lang="ts">
import { Folder, Home, Star } from "lucide-vue-next";

defineProps<{
  currentPath: string;
}>();

const emit = defineEmits<{
  (e: "navigate", path: string): void;
}>();

const quickAccess = [
  { name: "Home", path: "/", icon: Home },
  { name: "Documents", path: "/Documents", icon: Folder },
  { name: "Downloads", path: "/Downloads", icon: Folder },
];
</script>

<template>
  <aside class="w-56 bg-explorer-sidebar border-r border-explorer-border overflow-y-auto">
    <div class="p-2">
      <div class="text-xs font-semibold text-explorer-textSecondary uppercase tracking-wider px-2 py-2">
        Quick Access
      </div>
      <nav class="space-y-1">
        <button
          v-for="item in quickAccess"
          :key="item.path"
          class="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-explorer-hover"
          :class="{ 'bg-explorer-selected': currentPath === item.path }"
          @click="emit('navigate', item.path)"
        >
          <component :is="item.icon" class="w-4 h-4 text-yellow-500" />
          <span>{{ item.name }}</span>
        </button>
      </nav>
    </div>

    <div class="border-t border-explorer-border p-2 mt-2">
      <div class="text-xs font-semibold text-explorer-textSecondary uppercase tracking-wider px-2 py-2">
        Favorites
      </div>
      <div class="flex items-center gap-2 px-2 py-2 text-sm text-explorer-textSecondary">
        <Star class="w-4 h-4" />
        <span>No favorites yet</span>
      </div>
    </div>
  </aside>
</template>
