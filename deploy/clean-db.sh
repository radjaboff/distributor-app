#!/usr/bin/env bash
# ==========================================
# BOZOR DISTRIBUTOR - BAZANI TOZALASH (RESET)
# ==========================================
set -e

# .env faylidan DB ma'lumotlarini yuklash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

DB_USER="postgres"
if [ -f "$ENV_FILE" ]; then
    ENV_USER=$(grep -E '^DB_USER=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
    if [ -n "$ENV_USER" ]; then
        DB_USER="$ENV_USER"
    fi
fi

echo "=========================================="
echo "    BOZOR DISTRIBUTOR - BAZANI TOZALASH   "
echo "=========================================="
echo ""
echo "Qaysi usulda tozalamoqchisiz?"
echo "1) Butunlay tozalash (Hamma test do'konlar, tovarlar, bozorlar, savdolar 0 ga tushadi)"
echo "2) Faqat savdo va qarzlarni tozalash (Bozorlar, do'konlar va tovarlar saqlanadi, faqat savdo/to'lovlar 0 bo'ladi)"
echo "3) Bekor qilish"
echo ""
read -p "Tanlovingizni kiriting [1, 2 yoki 3]: " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "To'liq tozalash bajarilmoqda..."
    docker exec distributor_postgres psql -U "$DB_USER" -d distributor_db -c "TRUNCATE TABLE sale_items, sales, payments, stock_ins, shops, products, market_groups RESTART IDENTITY CASCADE;"
    echo ""
    echo "[OK] Barcha test ma'lumotlar muvaffaqiyatli tozalandi! Baza 0 holatiga keltirildi."
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Faqat savdo va to'lovlar tozalanmoqda..."
    docker exec distributor_postgres psql -U "$DB_USER" -d distributor_db -c "TRUNCATE TABLE sale_items, sales, payments, stock_ins RESTART IDENTITY CASCADE; UPDATE shops SET current_debt = 0;"
    echo ""
    echo "[OK] Savdo, kirim va qarzlar 0 qilindi! Bozorlar, do'konlar va tovarlar ro'yxati saqlab qolindi."
else
    echo "Amal bekor qilindi."
fi
