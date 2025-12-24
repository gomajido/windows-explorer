<script setup lang="ts">
import type { LazyTreeNode } from "@/application/services/FolderService";
import FolderTreeNodeVue from "./FolderTreeNode.vue";
import SkeletonLoader from "./SkeletonLoader.vue";

defineProps<{
  tree: LazyTreeNode[];
  selectedId: number | null;
  expandedIds: number[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  select: [folder: LazyTreeNode];
  expand: [node: LazyTreeNode];
  toggle: [folderId: number];
}>();
</script>

<template>
  <aside class="folder-tree h-full overflow-auto bg-white border-r border-gray-200" role="navigation" aria-label="Folder navigation">
    <div class="p-3 border-b border-gray-200 bg-gray-50">
      <h2 id="folder-tree-heading" class="text-sm font-semibold text-gray-700">Folders</h2>
    </div>
    
    <SkeletonLoader v-if="isLoading" type="tree" :count="6" />
    
    <div v-else-if="tree.length === 0" class="p-4 text-center text-gray-400" role="status">
      <span class="text-sm">No folders</span>
    </div>
    
    <ul v-else class="py-2" role="tree" aria-labelledby="folder-tree-heading">
      <FolderTreeNodeVue
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        :level="0"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </aside>
</template>
