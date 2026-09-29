package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.backup.BackupData;

public interface BackupService {
    BackupData exportBackup();
    void restoreBackup(BackupData backupData);
    java.io.ByteArrayInputStream exportDatabaseExcel();
}
