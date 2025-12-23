<script setup lang="ts">
import ErrorBoundary from "@/presentation/components/ErrorBoundary.vue";
import ErrorToast from "@/presentation/components/ErrorToast.vue";
</script>

<template>
  <ErrorBoundary>
    <RouterView />
    <ErrorToast />
  </ErrorBoundary>
</template>
