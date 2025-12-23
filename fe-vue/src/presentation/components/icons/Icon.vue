<script setup lang="ts">
import { computed } from "vue";
import { icons } from "./index";

const props = defineProps<{
  name: keyof typeof icons;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  class?: string;
}>();

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const iconHtml = computed(() => icons[props.name] || "");
const sizeClass = computed(() => sizeClasses[props.size || "md"]);
</script>

<template>
  <span 
    class="inline-flex items-center justify-center" 
    :class="[sizeClass, props.class]"
    v-html="iconHtml"
  />
</template>
