import { waitForClerk } from './waitForClerk'

export async function guestGuard(to) {
    if (!to.meta.requiresGuest) return
    await waitForClerk()
    if (window.Clerk?.user) {
        return { name: 'home' }
    }
}
