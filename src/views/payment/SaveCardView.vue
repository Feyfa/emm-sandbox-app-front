<template>
    <div class="content-inner">
                <div class="page-header">
                    <h1 class="page-title">Payment Methods</h1>
                    <p class="page-subtitle">
                        Saved cards are used for one-time purchases (e.g. buying contacts).
                        If you subscribed to a plan, your card was automatically saved.
                    </p>
                </div>

                <!-- Existing cards -->
                <div v-if="paymentStore.paymentMethods.length > 0" class="card-list">
                    <div
                        v-for="pm in paymentStore.paymentMethods"
                        :key="pm.id"
                        class="card-item"
                        :class="{ 'card-item--default': pm.is_default }"
                    >
                        <div class="card-info">
                            <span class="card-brand">{{ pm.brand || pm.payment_type }}</span>
                            <span class="card-last4">•••• {{ pm.last_four_digits || '——' }}</span>
                            <span v-if="pm.expires_at" class="card-expiry">
                                Exp {{ formatExpiry(pm.expires_at) }}
                            </span>
                            <span v-if="pm.is_default" class="card-badge">Default</span>
                        </div>
                        <div class="card-actions">
                            <button
                                v-if="!pm.is_default"
                                class="btn btn--secondary btn--sm"
                                :disabled="paymentStore.loading"
                                @click="setDefault(pm.id)"
                            >
                                Set Default
                            </button>
                            <button
                                class="btn btn--danger btn--sm"
                                :disabled="paymentStore.loading"
                                @click="removeCard(pm.id)"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
                <p v-else class="empty-text">No payment methods saved yet.</p>

                <!-- Add new card -->
                <div class="section-divider" />

                <div v-if="!showAddCard">
                    <button class="btn btn--primary" @click="openAddCard">
                        + Add Payment Method
                    </button>
                </div>

                <div v-else class="add-card-box">
                    <h2 class="section-title">Add New Card</h2>

                    <div v-if="loadingIntent" class="loading-text">Loading payment form...</div>

                    <div v-else-if="intentError" class="error-text">{{ intentError }}</div>

                    <div v-else>
                        <!-- Whop embed iframe for card collection -->
                        <div class="embed-container">
                            <iframe
                                :src="embedUrl"
                                class="whop-embed"
                                frameborder="0"
                                allow="payment"
                                @load="onEmbedLoad"
                            />
                        </div>

                        <div class="add-card-footer">
                            <button class="btn btn--ghost" @click="cancelAddCard">Cancel</button>
                        </div>
                    </div>
                </div>

                <div v-if="successMessage" class="success-text">{{ successMessage }}</div>
                <div v-if="paymentStore.error" class="error-text">{{ paymentStore.error }}</div>
    </div>
</template>

<script>
import { usePaymentStore } from "../../stores/payment";

export default {
    name: "SaveCardView",

    data() {
        return {
            showAddCard: false,
            loadingIntent: false,
            intentError: null,
            embedUrl: null,
            successMessage: null,
        };
    },

    computed: {
        paymentStore() {
            return usePaymentStore();
        },
    },

    mounted() {
        this.paymentStore.fetchPaymentMethods();
        window.addEventListener("message", this.handleEmbedMessage);
    },

    beforeUnmount() {
        window.removeEventListener("message", this.handleEmbedMessage);
    },

    methods: {
        formatExpiry(expiresAt) {
            if (!expiresAt) return "";
            const d = new Date(expiresAt);
            return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        },

        async openAddCard() {
            this.showAddCard = true;
            this.loadingIntent = true;
            this.intentError = null;
            this.successMessage = null;

            try {
                const intent = await this.paymentStore.getSetupIntent();
                // `purchase_url` is the full Whop checkout URL returned by POST /checkout_configurations
                this.embedUrl = intent.purchase_url;
            } catch (e) {
                this.intentError = e.message;
            } finally {
                this.loadingIntent = false;
            }
        },

        cancelAddCard() {
            this.showAddCard = false;
            this.embedUrl = null;
            this.intentError = null;
        },

        onEmbedLoad() {
            // Embed is loaded, waiting for user to submit card
        },

        /**
         * Listen for postMessage from the Whop embed iframe after card is saved.
         * Whop sends an event when the checkout configuration (setup mode) completes.
         * Note: Log `event.data` in console to inspect the exact format Whop sends.
         */
        async handleEmbedMessage(event) {
            // Only trust messages from whop.com
            if (!event.origin.includes("whop.com")) return;

            const raw  = event.data || {};
            const type = raw.type || "";
            const data = raw.data || raw;

            // Whop may send several event types on setup completion.
            // Common types: "whop:checkout:complete", "setup_intent.succeeded", "payment_method.created"
            const isSetupComplete = [
                "whop:checkout:complete",
                "setup_intent.succeeded",
                "payment_method.created",
            ].includes(type) || (raw.event === "complete" && raw.mode === "setup");

            if (!isSetupComplete) {
                // Log unrecognised messages for debugging
                console.log("[Whop embed message]", type, raw);
                return;
            }

            // Whop member_id may appear under different keys depending on the event
            const memberId = data.member_id || data.membership_id || null;
            const pmId     = data.payment_method_id || data.id || null;
            const card     = data.card || data.payment_method?.card || {};

            if (!pmId) {
                // Card was saved; webhook will handle DB write.
                // Just reload the list after a short delay.
                setTimeout(() => this.paymentStore.fetchPaymentMethods(), 2000);
                this.successMessage = "Card saved! Refreshing...";
                this.cancelAddCard();
                return;
            }

            try {
                await this.paymentStore.savePaymentMethod({
                    provider_customer_id:       memberId || "",   // Whop member_id (mber_xxx)
                    provider_payment_method_id: pmId,             // Whop payment_method_id (payt_xxx)
                    payment_type:               data.type || "credit_card",
                    last_four_digits:           card.last4 || null,
                    brand:                      card.brand || null,
                    expires_at: card.exp_year
                        ? `${card.exp_year}-${String(card.exp_month).padStart(2, "0")}`
                        : null,
                    metadata: data,
                });

                this.successMessage = "Payment method saved successfully!";
                this.cancelAddCard();
            } catch (e) {
                this.intentError = "Failed to save card: " + e.message;
            }
        },

        async setDefault(id) {
            await this.paymentStore.setDefaultPaymentMethod(id);
        },

        async removeCard(id) {
            if (!confirm("Remove this payment method?")) return;
            await this.paymentStore.deletePaymentMethod(id);
        },
    },
};
</script>

<style scoped>
.content-inner {
    padding: 48px 40px;
    max-width: 700px;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px;
}

.page-subtitle {
    font-size: 0.95rem;
    color: #666;
    margin: 0 0 32px;
}

/* ── Card List ── */
.card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.card-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    background: #fff;
}

.card-item--default {
    border-color: #4f46e5;
}

.card-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
    color: #333;
}

.card-brand {
    font-weight: 600;
    text-transform: capitalize;
}

.card-last4 {
    color: #555;
}

.card-expiry {
    color: #888;
    font-size: 0.85rem;
}

.card-badge {
    background: #4f46e5;
    color: #fff;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 20px;
}

.card-actions {
    display: flex;
    gap: 8px;
}

/* ── Add Card ── */
.section-divider {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 28px 0;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 16px;
}

.add-card-box {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 24px;
}

.embed-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}

.whop-embed {
    width: 100%;
    height: 320px;
    display: block;
}

.add-card-footer {
    display: flex;
    justify-content: flex-end;
}

.empty-text {
    color: #888;
    font-size: 0.95rem;
    margin-bottom: 24px;
}

.loading-text {
    color: #888;
    font-size: 0.9rem;
}

.success-text {
    color: #16a34a;
    margin-top: 16px;
    font-size: 0.9rem;
}

.error-text {
    color: #dc2626;
    margin-top: 8px;
    font-size: 0.9rem;
}

/* ── Buttons ── */
.btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn--primary {
    background: #4f46e5;
    color: #fff;
}

.btn--secondary {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #d5d5d5;
}

.btn--danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn--ghost {
    background: transparent;
    color: #555;
}

.btn--sm {
    padding: 5px 12px;
    font-size: 0.8rem;
}
</style>
