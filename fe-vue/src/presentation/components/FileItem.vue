<script setup lang="ts">
import { ref } from "vue";
import { Folder, File, Trash2, Pencil } from "lucide-vue-next";
import type { FileItem } from "@/domain/entities/FileItem";

const props = defineProps<{
  item: FileItem;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "open"): void;
  (e: "select"): void;
  (e: "delete"): void;
  (e: "rename", newName: string): void;
}>();

const isRenaming = ref(false);
const newName = ref("");

function startRename() {
  newName.value = props.item.name;
  isRenaming.value = true;
}

function confirmRename() {
  if (newName.value.trim() && newName.value !== props.item.name) {
    emit("rename", newName.value.trim());
  }
  isRenaming.value = false;
}

function cancelRename() {
  isRenaming.value = false;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileIcon(extension: string): string {
  const iconMap: Record<string, string> = {
    pdf: "text-red-500",
    doc: "text-blue-500",
    docx: "text-blue-500",
    xls: "text-green-500",
    xlsx: "text-green-500",
    jpg: "text-purple-500",
    jpeg: "text-purple-500",
    png: "text-purple-500",
    gif: "text-purple-500",
    mp3: "text-orange-500",
    mp4: "text-pink-500",
    zip: "text-yellow-600",
    txt: "text-gray-500",
  };
  return iconMap[extension.toLowerCase()] || "text-gray-400";
}
</script>

<template>
  <div
    class="flex flex-col items-center p-2 rounded cursor-pointer group relative"
    :class="{
      'bg-explorer-selected': isSelected,
      'hover:bg-explorer-hover': !isSelected,
    }"
    @click.stop="emit('select')"
    @dblclick="emit('open')"
  >
    <div class="relative">
      <Folder v-if="item.isDirectory" class="w-12 h-12 text-yellow-500" />
      <File v-else class="w-12 h-12" :class="getFileIcon(item.extension)" />
    </div>

    <div v-if="isRenaming" class="w-full mt-1">
      <input
        v-model="newName"
        type="text"
        class="w-full px-1 py-0.5 text-xs text-center border border-blue-500 rounded focus:outline-none"
        @keyup.enter="confirmRename"
        @keyup.escape="cancelRename"
        @blur="confirmRename"
        autofocus
      />
    </div>
    <div v-else class="w-full mt-1 text-center">
      <div class="text-xs truncate px-1" :title="item.name">
        {{ item.name }}
      </div>
      <div v-if="!item.isDirectory && item.size > 0" class="text-[10px] text-explorer-textSecondary">
        {{ formatSize(item.size) }}
      </div>
    </div>

    <div
      class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        class="p-1 rounded bg-white shadow hover:bg-gray-100"
        @click.stop="startRename"
        title="Rename"
      >
        <Pencil class="w-3 h-3 text-gray-600" />
      </button>
      <button
        class="p-1 rounded bg-white shadow hover:bg-red-50"
        @click.stop="emit('delete')"
        title="Delete"
      >
        <Trash2 class="w-3 h-3 text-red-500" />
      </button>
    </div>
  </div>
</template>
