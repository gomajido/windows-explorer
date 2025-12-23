<script setup lang="ts">
import { ref } from "vue";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RefreshCw,
  FolderPlus,
} from "lucide-vue-next";

defineProps<{
  canGoBack: boolean;
  canGoForward: boolean;
  canGoUp: boolean;
}>();

const emit = defineEmits<{
  (e: "goBack"): void;
  (e: "goForward"): void;
  (e: "goUp"): void;
  (e: "refresh"): void;
  (e: "newFolder", name: string): void;
}>();

const showNewFolderInput = ref(false);
const newFolderName = ref("");

function handleNewFolder() {
  if (newFolderName.value.trim()) {
    emit("newFolder", newFolderName.value.trim());
    newFolderName.value = "";
    showNewFolderInput.value = false;
  }
}

function cancelNewFolder() {
  newFolderName.value = "";
  showNewFolderInput.value = false;
}
</script>

<template>
  <div class="flex items-center gap-1 px-2 py-1 bg-explorer-toolbar border-b border-explorer-border">
    <button
      class="p-2 rounded hover:bg-explorer-hover disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="!canGoBack"
      @click="emit('goBack')"
      title="Back"
    >
      <ArrowLeft class="w-4 h-4" />
    </button>

    <button
      class="p-2 rounded hover:bg-explorer-hover disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="!canGoForward"
      @click="emit('goForward')"
      title="Forward"
    >
      <ArrowRight class="w-4 h-4" />
    </button>

    <button
      class="p-2 rounded hover:bg-explorer-hover disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="!canGoUp"
      @click="emit('goUp')"
      title="Up"
    >
      <ArrowUp class="w-4 h-4" />
    </button>

    <div class="w-px h-6 bg-explorer-border mx-1"></div>

    <button
      class="p-2 rounded hover:bg-explorer-hover"
      @click="emit('refresh')"
      title="Refresh"
    >
      <RefreshCw class="w-4 h-4" />
    </button>

    <div class="w-px h-6 bg-explorer-border mx-1"></div>

    <div v-if="showNewFolderInput" class="flex items-center gap-2">
      <input
        v-model="newFolderName"
        type="text"
        placeholder="Folder name"
        class="px-2 py-1 text-sm border border-explorer-border rounded focus:outline-none focus:border-blue-500"
        @keyup.enter="handleNewFolder"
        @keyup.escape="cancelNewFolder"
        autofocus
      />
      <button
        class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="handleNewFolder"
      >
        Create
      </button>
      <button
        class="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        @click="cancelNewFolder"
      >
        Cancel
      </button>
    </div>

    <button
      v-else
      class="flex items-center gap-1 px-2 py-1 rounded hover:bg-explorer-hover text-sm"
      @click="showNewFolderInput = true"
      title="New Folder"
    >
      <FolderPlus class="w-4 h-4" />
      <span>New Folder</span>
    </button>
  </div>
</template>
