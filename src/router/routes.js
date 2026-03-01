export const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiresGuest: true },
    },
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/payment/save-card',
        name: 'payment.save-card',
        component: () => import('../views/payment/SaveCardView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/payment/plans',
        name: 'payment.plans',
        component: () => import('../views/payment/PlansView.vue'),
        meta: { requiresAuth: true },
    },
]
