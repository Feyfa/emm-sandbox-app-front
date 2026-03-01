import { waitForClerk } from './waitForClerk'

export async function authGuard(to) {
    if (!to.meta.requiresAuth) return
    await waitForClerk()
    if (!window.Clerk?.user) {
        return { name: 'login' }
    }
}
