<script setup lang="ts">
import { computed } from "vue";
import type { LazyTreeNode } from "@/application/services/FolderService";

const props = defineProps<{
  node: LazyTreeNode;
  selectedId: number | null;
  expandedIds: number[];
  level: number;
}>();

const emit = defineEmits<{
  select: [folder: LazyTreeNode];
  expand: [node: LazyTreeNode];
  toggle: [folderId: number];
}>();

const isExpanded = computed(() => props.expandedIds.includes(props.node.id));

// Check if node has children or hasn't been loaded yet (assume it might have children)
const hasChildren = computed(() => props.node.children.length > 0 || !props.node.isLoaded);
const isSelected = computed(() => props.selectedId === props.node.id);
const isLoading = computed(() => props.node.isExpanding);

function toggle() {
  if (!isExpanded.value) {
    // Expanding - load children if not loaded
    if (!props.node.isLoaded) {
      emit("expand", props.node);
    }
  }
  emit("toggle", props.node.id);
}

function select() {
  emit("select", props.node);
}
</script>

<template>
  <li class="folder-node" role="treeitem" :aria-expanded="hasChildren ? isExpanded : undefined" :aria-selected="isSelected">
    <div
      class="folder-row flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      :class="{ 'bg-blue-100': isSelected }"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      tabindex="0"
      @click="select"
      @keydown.enter="select"
      @keydown.space.prevent="toggle"
      @keydown.right="!isExpanded && toggle()"
      @keydown.left="isExpanded && toggle()"
    >
      <button
        v-if="hasChildren"
        class="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
        @click.stop="toggle"
        :aria-label="isExpanded ? 'Collapse folder' : 'Expand folder'"
        tabindex="-1"
      >
        <svg
          v-if="isLoading"
          class="w-3 h-3 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="32" stroke-dashoffset="12" />
        </svg>
        <svg
          v-else
          class="w-3 h-3 transition-transform"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else class="w-4"></span>
      
      <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>
      
      <span class="text-sm truncate">{{ node.name }}</span>
    </div>
    
    <ul v-if="isExpanded && node.children.length > 0" class="children" role="group">
      <FolderTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        :level="level + 1"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </li>
</template>
