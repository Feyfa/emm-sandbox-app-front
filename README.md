# Vue 3 (front) — Docker

Local tanpa install Node/NPM. Dev dan Prod dipisah.

## Development (Vite, hot reload)

```bash
docker compose -f docker-compose.dev.yml up
```

→ http://localhost:5173

**Down:**
```bash
docker compose -f docker-compose.dev.yml down
```

## Production (build + Nginx)

```bash
docker compose -f docker-compose.prod.yml up -d
```

→ http://localhost:8001

**Down:**
```bash
docker compose -f docker-compose.prod.yml down
```

---

## Struktur

| Mode | Dockerfile | Compose | Nginx |
|------|------------|---------|-------|
| **Dev** | `Dockerfile.dev` | `docker-compose.dev.yml` | — |
| **Prod** | `Dockerfile.prod` | `docker-compose.prod.yml` | `docker/nginx/default.conf` |

---

## Install Vue (scaffold — sekali saja)

Folder `front/` sudah ada (Docker, README). Isi dengan project Vue pakai container Node (tanpa install Node di laptop):

**Dari root project** (satu tingkat di atas `front/`):

1. Masuk ke container dengan folder `front` di-mount:
   ```bash
   docker run -it --rm -v "$(pwd)/front":/app -w /app node:20-alpine sh
   ```
2. Di dalam container, buat project Vue di direktori saat ini (`.`):
   ```bash
   npx create-vue@latest .
   ```
   Jawab prompt (TypeScript, Router, dll.) atau pakai flag:  
   `npx create-vue@latest . -- --typescript --router`
3. Install dependency:
   ```bash
   npm install
   ```
4. Keluar: `exit`
5. Di `front/vite.config.ts` tambahkan agar dev server bisa diakses dari host:
   ```ts
   server: { host: '0.0.0.0', port: 5173 }
   ```

Setelah itu **untuk development** jalankan dari folder `front/`:

```bash
docker compose -f docker-compose.dev.yml up
```

Jadi: **install = satu kali pakai container Node (create-vue)**. **Sehari-hari = pakai dev** (docker-compose.dev.yml).
