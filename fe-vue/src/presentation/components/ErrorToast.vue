<script setup lang="ts">
import { computed } from "vue";
import { useErrorHandler, type AppError } from "@/application/composables/useErrorHandler";

const { activeErrors, dismissError } = useErrorHandler();

const visibleErrors = computed(() => activeErrors().slice(-3)); // Show max 3

function getIconClass(type: AppError["type"]) {
  switch (type) {
    case "error":
      return "text-red-500 bg-red-100";
    case "warning":
      return "text-yellow-500 bg-yellow-100";
    case "info":
      return "text-blue-500 bg-blue-100";
  }
}

function getBorderClass(type: AppError["type"]) {
  switch (type) {
    case "error":
      return "border-red-200";
    case "warning":
      return "border-yellow-200";
    case "info":
      return "border-blue-200";
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="error in visibleErrors"
          :key="error.id"
          class="bg-white rounded-lg shadow-lg border p-4 flex items-start gap-3"
          :class="getBorderClass(error.type)"
        >
          <!-- Icon -->
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getIconClass(error.type)">
            <!-- Error Icon -->
            <svg v-if="error.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- Warning Icon -->
            <svg v-else-if="error.type === 'warning'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <!-- Info Icon -->
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Message -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 break-words">{{ error.message }}</p>
          </div>

          <!-- Dismiss Button -->
          <button
            @click="dismissError(error.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
