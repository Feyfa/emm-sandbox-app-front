import { defineStore } from "pinia";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        isClerkLoaded: false,
        _getToken: null, // Store Clerk's getToken function for use across stores
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
    },

    actions: {
        setUser(user) {
            this.user = user;
        },

        clearUser() {
            this.user = null;
        },

        setClerkLoaded(val) {
            this.isClerkLoaded = val;
        },

        /**
         * Save Clerk's getToken function so all stores can use it.
         */
        setGetToken(fn) {
            this._getToken = fn;
        },

        /**
         * Get the current Clerk JWT token.
         */
        async getToken() {
            if (!this._getToken) return null;
            return await this._getToken();
        },

        async syncWithLaravel(getToken) {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    this.user = data.user;
                } else {
                    this.user = null;
                }
            } catch (e) {
                console.error("[AuthStore] syncWithLaravel error:", e);
                this.user = null;
            }
        },
    },
});
