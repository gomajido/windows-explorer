import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/presentation/pages/HomePage.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/presentation/pages/AboutPage.vue"),
    },
  ],
});

export default router;
