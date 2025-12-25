import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueVirtualScroller from "vue-virtual-scroller";

createApp(App)
  .use(router)
  .use(VueVirtualScroller)
  .mount("#app");
