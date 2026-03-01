<template>
    <aside class="sidebar">
        <!-- Brand -->
        <div class="sidebar-brand">
            <span class="brand-logo">EMM</span>
            <span class="brand-name">Exact Match Marketing</span>
        </div>

        <!-- Menu -->
        <nav class="sidebar-menu">
            <p class="menu-label">Menu</p>
            <RouterLink
                to="/"
                class="menu-item"
                active-class="menu-item--active"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
            </RouterLink>

            <p class="menu-label">Billing</p>
            <RouterLink
                to="/payment/save-card"
                class="menu-item"
                active-class="menu-item--active"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payment Methods
            </RouterLink>
            <RouterLink
                to="/payment/plans"
                class="menu-item"
                active-class="menu-item--active"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Plans
            </RouterLink>
        </nav>

        <!-- User & Logout -->
        <div class="sidebar-footer">
            <div class="user-info">
                <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    :alt="userName"
                    class="user-avatar"
                />
                <div v-else class="user-avatar user-avatar--placeholder">
                    {{ userName.charAt(0).toUpperCase() }}
                </div>
                <span class="user-name">{{ userName }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout" title="Logout">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            </button>
        </div>
    </aside>
</template>

<script>
import { useClerk } from "@clerk/vue";
import { useAuthStore } from "../stores/auth";

export default {
    name: "AppSidebar",

    setup() {
        const clerk = useClerk();
        return { clerk };
    },

    data() {
        return {
            showLogoutConfirm: false,
        };
    },

    computed: {
        authStore() {
            return useAuthStore();
        },
        userName() {
            return this.authStore.user?.name || "User";
        },
        userAvatar() {
            return this.authStore.user?.avatar_url || null;
        },
    },

    methods: {
        async handleLogout() {
            await this.clerk.signOut();
            this.authStore.clearUser();
            this.$router.push({ name: "login" });
        },
    },
};
</script>

<style scoped>
.sidebar {
    width: 240px;
    min-height: 100vh;
    background-color: #1a1a2e;
    color: #e0e0e0;
    display: flex;
    flex-direction: column;
    padding: 0;
    flex-shrink: 0;
}

/* Brand */
.sidebar-brand {
    display: flex;
    flex-direction: column;
    padding: 28px 20px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 3px;
}

.brand-name {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 2px;
    letter-spacing: 0.5px;
}

/* Menu */
.sidebar-menu {
    flex: 1;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.menu-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.3);
    margin: 0 8px 8px;
}

.menu-label + .menu-label,
.menu-item ~ .menu-label {
    margin-top: 20px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    transition:
        background 0.15s,
        color 0.15s;
}

.menu-item:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}

.menu-item--active {
    background-color: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    font-weight: 500;
}

/* Footer */
.sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.user-avatar--placeholder {
    background-color: #4a4a8a;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
}

.user-name {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.logout-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition:
        background 0.15s,
        color 0.15s;
    flex-shrink: 0;
}

.logout-btn:hover {
    background-color: rgba(255, 80, 80, 0.15);
    color: #ff6b6b;
}
</style>
