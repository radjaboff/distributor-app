#!/usr/bin/env bash
# ==============================================================================
# BOZOR DISTRIBUTOR - TIMEWEB VPS AVTOMATIK O'RNATISH VA SOZLASH SKRIPTI
# Server: Ubuntu 22.04 / 24.04 LTS
# Domen: abul2755.uz
# ==============================================================================

set -euo pipefail

DOMAIN="abul2755.uz"
APP_DIR="/opt/distributor-app"

echo "=========================================================="
echo "    Bozor Distributor - VPS Server O'rnatish Skripti"
echo "    Domen: https://${DOMAIN}"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "[XATOLIK] Ushbu skriptni 'sudo' yoki 'root' foydalanuvchisi sifatida ishga tushiring!"
  exit 1
fi

# 1. SWAP Xotira (2 GB) sozlash (1 GB RAM serverlarda xotira yetmay qolmasligi uchun)
echo "[1/8] SWAP xotira tekshirilmoqda..."
SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')
if [ "${SWAP_TOTAL:-0}" -lt 1024 ]; then
    echo "2 GB SWAP xotira yaratilmoqda..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile || true
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo "SWAP xotira muvaffaqiyatli yoqildi!"
else
    echo "SWAP xotira allaqachon mavjud (${SWAP_TOTAL} MB)."
fi

# 2. Tizim paketlarini yangilash
echo "[2/8] Tizim paketlari yangilanmoqda..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw certbot python3-certbot-nginx nginx

# 3. Docker va Docker Compose o'rnatish (agar mavjud bo'lmasa)
if ! command -v docker &> /dev/null; then
    echo "[3/8] Docker o'rnatilmoqda..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo "[3/8] Docker allaqachon o'rnatilgan."
fi

# 4. UFW Xavfsizlik Devorini (Firewall) sozlash
echo "[4/8] Xavfsizlik devori (UFW) sozlanmoqda..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# 5. .env Faylini tekshirish
if [ ! -f "${APP_DIR}/.env" ]; then
    echo "[DIQQAT] ${APP_DIR}/.env fayli topilmadi!"
    if [ -f "${APP_DIR}/.env.example" ]; then
        echo "${APP_DIR}/.env.example dan nusxa olinmoqda. Iltimos parollarni tahrirlang!"
        cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
        # Tasodifiy kuchli remember-me key generatsiya qilish
        RANDOM_KEY=$(openssl rand -hex 24)
        sed -i "s/sizning_ixtiyoriy_uzun_maxfiy_kalitingiz_987654/${RANDOM_KEY}/g" "${APP_DIR}/.env"
    fi
fi

# 6. Let's Encrypt SSL Sertifikat olish yoki vaqtinchalik sertifikat
echo "[5/8] SSL sertifikat tekshirilmoqda..."
mkdir -p "/etc/letsencrypt/live/${DOMAIN}"
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo "Nginx ishga tushishi uchun boshlang'ich SSL yaratilmoqda..."
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" \
        -out "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" \
        -subj "/CN=${DOMAIN}"
fi

# Rasmiy Let's Encrypt sertifikat olishga urinish
echo "Rasmiy Let's Encrypt sertifikati olinmoqda: ${DOMAIN}..."
systemctl stop nginx || true
certbot certonly --standalone -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email || true
systemctl start nginx || true

# 7. Nginx konfiguratsiyasini o'rnatish
echo "[6/8] Nginx sozlanmoqda..."
cp "${APP_DIR}/deploy/nginx/abul2755.uz.conf" /etc/nginx/sites-available/distributor.conf
ln -sf /etc/nginx/sites-available/distributor.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx sintaksisini tekshirib, qayta yuklash
nginx -t
systemctl reload nginx

# 8. Avtomatik Baza Zaxiralash (Cron) sozlash
echo "[7/8] Baza zaxiralash (Kunlik soat 03:00 da) sozlanmoqda..."
chmod +x "${APP_DIR}/deploy/backup/backup.sh"
CRON_JOB="0 3 * * * ${APP_DIR}/deploy/backup/backup.sh > /dev/null 2>&1"
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -Fv "${APP_DIR}/deploy/backup/backup.sh" || true)
printf "%s\n%s\n" "${EXISTING_CRON}" "${CRON_JOB}" | sed '/^$/d' | crontab -

# 9. Docker konteynerlarini ishga tushirish
echo "[8/8] Docker konteynerlari ishga tushirilmoqda..."
cd "${APP_DIR}"
docker compose down || true
docker compose up -d --build

echo ""
echo "=========================================================="
echo "    Muvaffaqiyatli yakunlandi! 🚀"
echo "    Sayt manzili: https://${DOMAIN}"
echo "    Baza konteyneri: distributor_postgres"
echo "    Ilova konteyneri: distributor_app"
echo "    Kunlik zaxira: /var/backups/distributor"
echo "=========================================================="
