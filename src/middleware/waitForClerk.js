export function waitForClerk() {
    return new Promise((resolve) => {
        // Jika Clerk sudah ready saat fungsi dipanggil, langsung lanjut tanpa tunggu
        if (window.Clerk?.loaded) return resolve()

        // Clerk belum ready — cek setiap 50ms sampai ready
        const interval = setInterval(() => {
            if (window.Clerk?.loaded) {
                clearInterval(interval) // Hentikan pengecekan
                resolve() // Lanjut ke middleware berikutnya
            }
        }, 50)

        // Safety net: jika Clerk tidak ready dalam 10 detik (misal koneksi lambat
        // atau clerk.browser.js gagal load), paksa lanjut agar halaman tidak freeze
        setTimeout(() => {
            clearInterval(interval)
            resolve()
        }, 10000)
    })
}
