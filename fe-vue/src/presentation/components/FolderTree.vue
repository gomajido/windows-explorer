<script setup lang="ts">
import type { LazyTreeNode } from "@/application/services/FolderService";
import FolderTreeNodeVue from "./FolderTreeNode.vue";

defineProps<{
  tree: LazyTreeNode[];
  selectedId: number | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  select: [folder: LazyTreeNode];
  expand: [node: LazyTreeNode];
}>();
</script>

<template>
  <div class="folder-tree h-full overflow-auto bg-white border-r border-gray-200">
    <div class="p-3 border-b border-gray-200 bg-gray-50">
      <h2 class="text-sm font-semibold text-gray-700">Folders</h2>
    </div>
    
    <div v-if="isLoading" class="p-4 text-center text-gray-500">
      <span class="text-sm">Loading...</span>
    </div>
    
    <div v-else-if="tree.length === 0" class="p-4 text-center text-gray-400">
      <span class="text-sm">No folders</span>
    </div>
    
    <div v-else class="py-2">
      <FolderTreeNodeVue
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
        :level="0"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
      />
    </div>
  </div>
</template>
