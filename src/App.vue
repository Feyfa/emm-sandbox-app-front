<template>
    <div class="app-layout" :class="{ 'app-layout--no-sidebar': !showSidebar }">
        <AppSidebar v-if="showSidebar" />
        <main class="app-content">
            <RouterView />
        </main>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@clerk/vue'
import AppSidebar from './components/AppSidebar.vue'
import { useAuthStore } from './stores/auth'

export default {
    name: 'App',
    components: { AppSidebar },

    setup() {
        const { isLoaded, isSignedIn, getToken } = useAuth()
        const route = useRoute()
        const showSidebar = computed(() => route.meta?.requiresAuth === true)

        return { isLoaded, isSignedIn, getToken, showSidebar }
    },

    watch: {
        isLoaded(val) {
            if (val) {
                const authStore = useAuthStore()
                authStore.setClerkLoaded(true)
                authStore.setGetToken(this.getToken)
            }
        },

        isSignedIn: {
            immediate: true,
            async handler(val) {
                const authStore = useAuthStore()
                if (val) {
                    await authStore.syncWithLaravel(this.getToken)
                } else {
                    authStore.clearUser()
                }
            },
        },
    },
}
</script>

<style>
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.app-layout {
    display: flex;
    min-height: 100vh;
}

.app-layout--no-sidebar {
    display: block;
}

.app-content {
    flex: 1;
    background-color: #f9f9f9;
    overflow-y: auto;
}
</style>
