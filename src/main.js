import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VCalendar from "v-calendar";

import "v-calendar/dist/style.css";
import "./assets/scss/styles.scss";

createApp(App).use(store).use(router).use(VCalendar, {}).mount("#app");
