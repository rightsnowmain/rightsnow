#!/usr/bin/env bash
set -e

echo "=== Initializing News Publishing & Digital Archive System ==="

# 1. Environment files
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[+] Root .env created from .env.example"
fi

if [ ! -f backend/.env ]; then
  cp .env.example backend/.env
  echo "[+] backend/.env created"
fi

if [ ! -f frontend/.env ]; then
  cp .env.example frontend/.env
  echo "[+] frontend/.env created"
fi

# 2. Dependencies
echo "[+] Installing backend dependencies..."
cd backend && npm install
echo "[+] Generating Prisma Client..."
npx prisma generate

echo "[+] Installing frontend dependencies..."
cd ../frontend && npm install

echo "=== Setup complete! Run 'npm run dev:all' to start development ==="
