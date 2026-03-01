import { createApp } from "vue";
import { createPinia } from "pinia";
import { clerkPlugin } from "@clerk/vue";

import App from "./App.vue";
import router from "./router";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const FRONTEND_API_URL = import.meta.env.VITE_CLERK_FRONTEND_API_URL;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(clerkPlugin, {
    publishableKey: PUBLISHABLE_KEY,
    clerkJSUrl: `${FRONTEND_API_URL}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`,
});

app.mount("#app");
