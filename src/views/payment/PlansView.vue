<template>
    <div class="content-inner">

                <template v-if="!showEmbed">
                    <div class="page-header">
                        <h1 class="page-title">Choose a Plan</h1>
                        <p class="page-subtitle">Select the plan that fits your needs</p>
                    </div>

                    <div class="plans-grid">
                    <div
                        v-for="plan in plans"
                        :key="plan.id"
                        class="plan-card"
                        :class="{ 'plan-card--featured': plan.featured }"
                    >
                        <div class="plan-header">
                            <span v-if="plan.featured" class="plan-badge">Most Popular</span>
                            <h2 class="plan-name">{{ plan.name }}</h2>
                            <div class="plan-price">
                                <span class="plan-amount">${{ (plan.price_cents / 100).toFixed(2) }}</span>
                                <span class="plan-period">/ {{ plan.period }}</span>
                            </div>
                        </div>

                        <ul class="plan-features">
                            <li v-for="feature in plan.features" :key="feature">
                                ✓ {{ feature }}
                            </li>
                        </ul>

                        <button
                            class="btn btn--subscribe"
                            :class="{ 'btn--featured': plan.featured }"
                            :disabled="loadingCheckout"
                            @click="openCheckout(plan)"
                        >
                            {{ loadingCheckout ? "Preparing..." : "Subscribe" }}
                        </button>
                    </div>
                    </div>

                    <div v-if="loadingCheckout" class="loading-text">Preparing checkout...</div>
                    <div v-if="successMessage" class="success-text">{{ successMessage }}</div>
                    <div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>
                    <div v-if="checkoutError" class="error-text">{{ checkoutError }}</div>
                </template>

                <template v-else>
                    <div class="embed-header">
                        <button class="btn-back" @click="cancelEmbed">← Back to Plans</button>
                        <h1 class="page-title">{{ selectedPlan?.name || 'Checkout' }}</h1>
                        <p class="page-subtitle">Complete your subscription securely below.</p>
                    </div>

                    <div
                        v-if="checkoutSessionId && selectedPlan"
                        :key="checkoutEmbedKey"
                        id="whop-embedded-checkout"
                        class="whop-embed-container"
                        :data-whop-checkout-plan-id="selectedPlan.plan_id"
                        :data-whop-checkout-session="checkoutSessionId"
                        :data-whop-checkout-return-url="returnUrl"
                        data-whop-checkout-environment="sandbox"
                    ></div>

                    <div v-if="loadingCheckout" class="loading-text">Preparing checkout...</div>
                    <div v-if="checkoutError" class="error-text">{{ checkoutError }}</div>
                </template>

    </div>
</template>

<script>
import { usePaymentStore } from "../../stores/payment";

// Whop product checkout URLs (sandbox)
// Format: https://sandbox.whop.com/{company-slug}/{product-slug}/
const PLANS = [
    {
        id: "basic",
        name: "Agency Basic Plan",
        price_cents: 500,
        period: "2 days",
        plan_id: "plan_lA41QoEa0HYwv",
        checkout_url: "https://sandbox.whop.com/checkout/plan_lA41QoEa0HYwv",
        featured: false,
        features: [
            "Predict ID module",
            "500 credits/month",
            "Email support",
        ],
    },
    {
        id: "medium",
        name: "Agency Medium Plan",
        price_cents: 1000,
        period: "2 days",
        plan_id: "plan_HHM0ArqhdrOKt",
        checkout_url: "https://sandbox.whop.com/checkout/plan_HHM0ArqhdrOKt",
        featured: true,
        features: [
            "Predict ID + Clean ID modules",
            "1,500 credits/month",
            "Priority support",
        ],
    },
    {
        id: "advanced",
        name: "Agency Advanced Plan",
        price_cents: 2000,
        period: "2 days",
        plan_id: "plan_0vwwahzI4L5KQ",
        checkout_url: "https://sandbox.whop.com/checkout/plan_0vwwahzI4L5KQ",
        featured: false,
        features: [
            "All modules (Predict, Clean, Audience ID)",
            "Unlimited credits",
            "Dedicated support",
        ],
    },
];

export default {
    name: "PlansView",

    data() {
        return {
            plans: PLANS,
            successMessage: null,
            errorMessage: null,
            savingCard: false,
            loadingCheckout: false,
            checkoutError: null,
            selectedPlan: null,
            showEmbed: false,
            checkoutSessionId: null,
            checkoutEmbedKey: 0,
            returnUrl: `${window.location.origin}/payment/plans`,
        };
    },

    computed: {
        paymentStore() {
            return usePaymentStore();
        },
    },

    mounted() {
        this.paymentStore.fetchPaymentMethods();
    },

    methods: {
        async openCheckout(plan) {
            this.successMessage = null;
            this.errorMessage = null;
            this.checkoutError = null;
            this.selectedPlan = plan;
            this.showEmbed = false;
            this.checkoutSessionId = null;

            this.loadingCheckout = true;
            try {
                // Create checkout configuration with metadata on backend
                const checkout = await this.paymentStore.getSubscriptionCheckout(plan.plan_id);
                const checkoutConfigId = checkout.checkout_config_id || null;

                if (!checkoutConfigId) {
                    this.checkoutError = "Checkout configuration ID not returned by server.";
                    return;
                }

                console.log('✅ Checkout config ID received:', checkoutConfigId);
                console.log('📦 Full checkout response:', checkout);

                this.checkoutSessionId = checkoutConfigId;
                this.checkoutEmbedKey += 1;
                this.showEmbed = true;
            } catch (e) {
                this.checkoutError = e.message || "Failed to create checkout.";
                console.error('❌ Checkout error:', e);
            } finally {
                this.loadingCheckout = false;
            }
        },

        cancelEmbed() {
            this.showEmbed = false;
            this.selectedPlan = null;
            this.checkoutSessionId = null;
            this.checkoutError = null;
        },
    },
};
</script>

<style scoped>
.content-inner {
    padding: 48px 40px;
    max-width: 900px;
}

.page-header {
    margin-bottom: 32px;
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
    margin: 0;
}

.embed-header {
    margin-bottom: 24px;
}

.btn-back {
    background: none;
    border: none;
    color: #4f46e5;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0;
    margin-bottom: 12px;
}

.btn-back:hover {
    text-decoration: underline;
}

.whop-embed-container {
    width: 100%;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    min-height: 640px;
    background: #fff;
}

/* ── Plans Grid ── */
.plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.plan-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 14px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.plan-card--featured {
    border-color: #4f46e5;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.12);
}

.plan-badge {
    display: inline-block;
    background: #4f46e5;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
}

.plan-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.plan-price {
    margin-top: 8px;
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.plan-amount {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1a1a1a;
}

.plan-period {
    font-size: 0.85rem;
    color: #888;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.plan-features li {
    font-size: 0.88rem;
    color: #444;
}

/* ── Subscribe Button ── */
.btn--subscribe {
    width: 100%;
    padding: 11px;
    border-radius: 8px;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    background: #f0f0f0;
    color: #333;
    transition: background 0.15s;
}

.btn--subscribe:hover {
    background: #e0e0e0;
}

.btn--featured {
    background: #4f46e5;
    color: #fff;
}

.btn--featured:hover {
    background: #4338ca;
}

/* ── Status ── */
.loading-text {
    color: #888;
    font-size: 0.9rem;
    margin-top: 8px;
}

.success-text {
    color: #16a34a;
    margin-top: 16px;
    font-size: 0.9rem;
    font-weight: 600;
}

.error-text {
    color: #dc2626;
    margin-top: 8px;
    font-size: 0.9rem;
}
</style>
