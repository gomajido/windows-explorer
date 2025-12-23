<script setup lang="ts">
import type { Folder } from "@/domain/entities/Folder";

defineProps<{
  selectedFolder: Folder | null;
  children: Folder[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  openFolder: [folder: Folder];
}>();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

function getIcon(item: Folder): string {
  if (item.isFolder) return "📁";
  const ext = item.name.split(".").pop()?.toLowerCase();
  const icons: Record<string, string> = {
    txt: "📄",
    pdf: "📕",
    doc: "📘",
    docx: "📘",
    xls: "📗",
    xlsx: "📗",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    mp3: "🎵",
    mp4: "🎬",
    zip: "📦",
    exe: "⚙️",
    json: "📋",
  };
  return icons[ext || ""] || "📄";
}
</script>

<template>
  <div class="content-panel h-full overflow-auto bg-white">
    <div class="p-3 border-b border-gray-200 bg-gray-50">
      <h2 class="text-sm font-semibold text-gray-700">
        {{ selectedFolder ? selectedFolder.name : "Select a folder" }}
      </h2>
    </div>
    
    <div v-if="!selectedFolder" class="flex items-center justify-center h-64 text-gray-400">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-sm">Click a folder on the left to view contents</p>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="p-4 text-center text-gray-500">
      <span class="text-sm">Loading...</span>
    </div>
    
    <div v-else-if="children.length === 0" class="p-4 text-center text-gray-400">
      <span class="text-sm">This folder is empty</span>
    </div>
    
    <div v-else class="p-2">
      <table class="w-full">
        <thead class="text-left text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Type</th>
            <th class="px-3 py-2">Modified</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in children"
            :key="item.id"
            class="hover:bg-gray-50 cursor-pointer border-t border-gray-100"
            @dblclick="item.isFolder && emit('openFolder', item)"
          >
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ getIcon(item) }}</span>
                <span class="text-sm">{{ item.name }}</span>
              </div>
            </td>
            <td class="px-3 py-2 text-sm text-gray-500">
              {{ item.isFolder ? "Folder" : "File" }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-500">
              {{ formatDate(item.updatedAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
