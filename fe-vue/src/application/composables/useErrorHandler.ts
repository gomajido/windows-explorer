import { ref, readonly } from "vue";

export interface AppError {
  id: string;
  message: string;
  type: "error" | "warning" | "info";
  timestamp: Date;
  dismissed: boolean;
}

const errors = ref<AppError[]>([]);
const lastError = ref<AppError | null>(null);

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useErrorHandler() {
  function addError(message: string, type: AppError["type"] = "error"): void {
    const error: AppError = {
      id: generateId(),
      message,
      type,
      timestamp: new Date(),
      dismissed: false,
    };

    errors.value.push(error);
    lastError.value = error;

    // Auto-dismiss warnings and info after 5 seconds
    if (type !== "error") {
      setTimeout(() => dismissError(error.id), 5000);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${type.toUpperCase()}]`, message);
    }
  }

  function dismissError(id: string): void {
    const error = errors.value.find((e) => e.id === id);
    if (error) {
      error.dismissed = true;
    }
  }

  function dismissAll(): void {
    errors.value.forEach((e) => (e.dismissed = true));
  }

  function clearErrors(): void {
    errors.value = [];
    lastError.value = null;
  }

  function handleApiError(error: unknown): void {
    if (error instanceof Error) {
      if (error.message.includes("fetch") || error.message.includes("network")) {
        addError("Network error. Please check your connection.", "error");
      } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
        addError("Session expired. Please login again.", "warning");
      } else if (error.message.includes("403") || error.message.includes("forbidden")) {
        addError("You don't have permission to perform this action.", "error");
      } else if (error.message.includes("404")) {
        addError("The requested resource was not found.", "warning");
      } else if (error.message.includes("500")) {
        addError("Server error. Please try again later.", "error");
      } else {
        addError(error.message, "error");
      }
    } else {
      addError("An unexpected error occurred.", "error");
    }
  }

  const activeErrors = () => errors.value.filter((e) => !e.dismissed);

  return {
    errors: readonly(errors),
    lastError: readonly(lastError),
    activeErrors,
    addError,
    dismissError,
    dismissAll,
    clearErrors,
    handleApiError,
  };
}
