<template>
    <div class="content-inner">
        <h1 class="welcome-title">Welcome, {{ userName }}</h1>
        <p class="welcome-subtitle">Apa Exact Match Marketing</p>
    </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";

export default {
    name: "HomeView",

    computed: {
        authStore() {
            return useAuthStore();
        },
        userName() {
            return this.authStore.user?.name || "User";
        },
    },
};
</script>

<style scoped>
.content-inner {
    padding: 48px 40px;
}

.welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px;
}

.welcome-subtitle {
    font-size: 1rem;
    color: #666;
    margin: 0;
}
</style>
