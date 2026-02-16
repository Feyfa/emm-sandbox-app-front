#!/bin/sh

# Cek apakah node_modules sudah ada
if [ ! -d "node_modules" ]; then
  echo "node_modules tidak ditemukan, menjalankan npm install --legacy-peer-deps..."
  npm install --legacy-peer-deps
elif [ "package-lock.json" -nt "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "package.json atau package-lock.json lebih baru dari node_modules, menjalankan npm install --legacy-peer-deps..."
  npm install --legacy-peer-deps
else
  echo "node_modules sudah ada dan up-to-date, melewati npm install"
fi

# Jalankan dev server
exec npm run dev
