#!/usr/bin/env bash
# ==============================================================================
# BOZOR DISTRIBUTOR - AVTOMATIK KUNLIK BAZA ZAXIRALASH SKRIPTI (CRON BACKUP)
# Har kecha soat 03:00 da ishga tushadi va bazani siqilgan holda saqlaydi.
# 30 kundan eski nusxalarni avtomatik tozalaydi.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/var/backups/distributor"
LOG_FILE="/var/log/distributor_backup.log"
DATE_STR=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/distributor_backup_${DATE_STR}.sql.gz"
CONTAINER_NAME="distributor_postgres"
DB_NAME="distributor_db"
DB_USER="postgres"

mkdir -p "${BACKUP_DIR}"
touch "${LOG_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Baza zaxira nusxasi boshlanmoqda..." >> "${LOG_FILE}"

# 1. PostgreSQL konteyneridan pg_dump olib, gzip bilan siqamiz
if docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"; then
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] Baza muvaffaqiyatli saqlandi: ${BACKUP_FILE} (Hajmi: ${FILE_SIZE})" >> "${LOG_FILE}"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] Baza zaxiralashda xatolik yuz berdi!" >> "${LOG_FILE}"
    exit 1
fi

# 2. 30 kundan eski arxivlarni avtomatik o'chiramiz (server diskini to'lib ketishidan saqlash)
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "distributor_backup_*.sql.gz" -mtime +30 -delete -print | wc -l)
if [ "${DELETED_COUNT}" -gt 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [CLEANUP] ${DELETED_COUNT} ta 30 kundan eski nusxa tozalandi." >> "${LOG_FILE}"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [COMPLETED] Jarayon yakunlandi." >> "${LOG_FILE}"
