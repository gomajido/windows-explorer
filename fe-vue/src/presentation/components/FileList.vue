<script setup lang="ts">
import type { FileItem } from "@/domain/entities/FileItem";
import FileItemComponent from "./FileItem.vue";

defineProps<{
  items: FileItem[];
  selectedItem: FileItem | null;
}>();

const emit = defineEmits<{
  (e: "open", item: FileItem): void;
  (e: "select", item: FileItem | null): void;
  (e: "delete", item: FileItem): void;
  (e: "rename", item: FileItem, newName: string): void;
}>();

function handleBackgroundClick() {
  emit("select", null);
}
</script>

<template>
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 p-2 min-h-full"
    @click.self="handleBackgroundClick"
  >
    <div
      v-if="items.length === 0"
      class="col-span-full flex items-center justify-center h-32 text-explorer-textSecondary"
    >
      This folder is empty
    </div>

    <FileItemComponent
      v-for="item in items"
      :key="item.path"
      :item="item"
      :is-selected="selectedItem?.path === item.path"
      @open="emit('open', item)"
      @select="emit('select', item)"
      @delete="emit('delete', item)"
      @rename="(newName) => emit('rename', item, newName)"
    />
  </div>
</template>
