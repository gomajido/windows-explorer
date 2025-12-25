import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

// Configure TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data fresh for 60 seconds
      gcTime: 5 * 60 * 1000, // Cache kept for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});

createApp(App)
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .mount("#app");
