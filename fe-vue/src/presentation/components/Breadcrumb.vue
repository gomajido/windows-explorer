<script setup lang="ts">
import { computed } from "vue";
import { ChevronRight, Folder } from "lucide-vue-next";

const props = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: "navigate", path: string): void;
}>();

const segments = computed(() => {
  const parts = props.path.split("/").filter(Boolean);
  const result = [{ name: "Root", path: "/" }];
  let currentPath = "";
  for (const part of parts) {
    currentPath += "/" + part;
    result.push({ name: part, path: currentPath });
  }
  return result;
});
</script>

<template>
  <div class="flex items-center gap-1 px-3 py-2 bg-white border-b border-explorer-border text-sm">
    <Folder class="w-4 h-4 text-yellow-500" />
    <template v-for="(segment, index) in segments" :key="segment.path">
      <ChevronRight v-if="index > 0" class="w-3 h-3 text-explorer-textSecondary" />
      <button
        class="px-1 py-0.5 rounded hover:bg-explorer-hover"
        :class="{ 'font-medium': index === segments.length - 1 }"
        @click="emit('navigate', segment.path)"
      >
        {{ segment.name }}
      </button>
    </template>
  </div>
</template>
