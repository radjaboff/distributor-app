#!/usr/bin/env bash
# ==============================================================================
# BOZOR DISTRIBUTOR - KODNI YANGILASH VA QAYTA ISHGA TUSHIRISH (UPDATE)
# ==============================================================================

set -euo pipefail

APP_DIR="/opt/distributor-app"

echo "=== Bozor Distributor: Yangilash boshlandi ==="
cd "${APP_DIR}"

echo "[1/3] Git orqali eng so'nggi o'zgarishlar olinmoqda..."
git pull

echo "[2/3] Konteynerlar qayta yig'ilmoqda (build)..."
docker compose up -d --build

echo "[3/3] Konteynerlar holati tekshirilmoqda..."
docker compose ps

echo "=== Yangilanish muvaffaqiyatli yakunlandi! ==="
