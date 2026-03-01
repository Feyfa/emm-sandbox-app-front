import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { beforeEachMiddleware } from '../middleware'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(beforeEachMiddleware)

export default router
