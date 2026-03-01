import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

// Helper to make authenticated API calls
async function apiFetch(path, options = {}) {
    const authStore = useAuthStore();
    const token = await authStore.getToken();

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const usePaymentStore = defineStore("payment", {
    state: () => ({
        paymentMethods: [],
        invoices: [],
        invoicesMeta: null,
        setupIntent: null,
        loading: false,
        error: null,
    }),

    getters: {
        defaultPaymentMethod: (state) =>
            state.paymentMethods.find((pm) => pm.is_default) || null,

        hasPaymentMethod: (state) =>
            state.paymentMethods.length > 0,
    },

    actions: {
        // ─── Payment Methods ───────────────────────────────────────────────────

        async fetchPaymentMethods() {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/payment-methods");
                this.paymentMethods = res.data || [];
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async getSetupIntent() {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/payment-methods/setup-intent", {
                    method: "POST",
                });
                this.setupIntent = res;
                return res;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async getSubscriptionCheckout(planId) {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/payment-methods/subscription-checkout", {
                    method: "POST",
                    body: JSON.stringify({ plan_id: planId }),
                });
                return res;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async savePaymentMethod(payload) {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/payment-methods", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                this.paymentMethods.unshift(res.data);
                return res.data;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async setDefaultPaymentMethod(id) {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch(`/api/payment-methods/${id}/default`, {
                    method: "PUT",
                });
                await this.fetchPaymentMethods();
                return res.data;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async deletePaymentMethod(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiFetch(`/api/payment-methods/${id}`, { method: "DELETE" });
                this.paymentMethods = this.paymentMethods.filter((pm) => pm.id !== id);
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        // ─── Invoices ─────────────────────────────────────────────────────────

        async fetchInvoices(page = 1) {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch(`/api/invoices?page=${page}`);
                this.invoices = res.data || [];
                this.invoicesMeta = res.meta || null;
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async chargeCredits(amount, description = "") {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/invoices/charge-credits", {
                    method: "POST",
                    body: JSON.stringify({ amount, description }),
                });
                return res.data;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async subscribePlan(planId, description = "") {
            this.loading = true;
            this.error = null;
            try {
                const res = await apiFetch("/api/invoices/subscribe", {
                    method: "POST",
                    body: JSON.stringify({ plan_id: planId, description }),
                });
                return res.data;
            } catch (e) {
                this.error = e.message;
                throw e;
            } finally {
                this.loading = false;
            }
        },
    },
});
