<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";

interface ErrorInfo {
  message: string;
  stack?: string;
  componentName?: string;
}

const error = ref<ErrorInfo | null>(null);
const hasError = ref(false);

function handleRetry() {
  error.value = null;
  hasError.value = false;
}

function handleReload() {
  window.location.reload();
}

onErrorCaptured((err, instance, info) => {
  console.error("Error captured by ErrorBoundary:", err);
  console.error("Component:", instance);
  console.error("Info:", info);

  error.value = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    componentName: instance?.$options?.name || "Unknown",
  };
  hasError.value = true;

  // Prevent error from propagating
  return false;
});
</script>

<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
      <!-- Error Icon -->
      <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <!-- Error Title -->
      <h2 class="text-xl font-semibold text-gray-800 mb-2">
        Something went wrong
      </h2>

      <!-- Error Message -->
      <p class="text-gray-600 mb-4">
        {{ error?.message || "An unexpected error occurred" }}
      </p>

      <!-- Error Details (Development Only) -->
      <details v-if="error?.stack" class="mb-4 text-left">
        <summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
          Show error details
        </summary>
        <pre class="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-40">{{ error.stack }}</pre>
      </details>

      <!-- Action Buttons -->
      <div class="flex gap-3 justify-center">
        <button
          @click="handleRetry"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
        <button
          @click="handleReload"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Reload Page
        </button>
      </div>

      <!-- Support Info -->
      <p class="mt-4 text-xs text-gray-400">
        If the problem persists, please contact support
      </p>
    </div>
  </div>

  <!-- Normal Content -->
  <div v-else class="error-boundary-content">
    <slot />
  </div>
</template>
