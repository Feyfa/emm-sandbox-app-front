import { authGuard } from './authGuard'
import { guestGuard } from './guestGuard'

// Daftarkan semua middleware di sini secara berurutan
const middlewares = [authGuard, guestGuard]

export async function beforeEachMiddleware(to, from) {
    for (const middleware of middlewares) {
        const result = await middleware(to, from)
        if (result) return result
    }
}
