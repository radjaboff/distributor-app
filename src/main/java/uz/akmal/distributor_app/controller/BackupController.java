package uz.akmal.distributor_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.distributor_app.dto.backup.BackupData;
import uz.akmal.distributor_app.service.BackupService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@Slf4j
@Tag(name = "Backup", description = "Baza zaxira nusxasi (Backup) va qayta tiklash (Restore)")
public class BackupController {

    private final BackupService backupService;
    private final ObjectMapper objectMapper;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
        this.objectMapper = new ObjectMapper()
                .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @GetMapping("/download-excel")
    @Operation(summary = "Baza zaxira nusxasini Excel (.xlsx) fayl qilib yuklab olish")
    public ResponseEntity<byte[]> downloadExcelBackup() {
        try {
            java.io.ByteArrayInputStream in = backupService.exportDatabaseExcel();
            byte[] bytes = in.readAllBytes();

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"));
            String filename = "Bozor_Distributor_Baza_" + timestamp + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (Exception e) {
            log.error("Excel backup yuklashda xatolik:", e);
            throw new RuntimeException("Excel zaxira faylini tayyorlashda xatolik: " + e.getMessage());
        }
    }

    @GetMapping("/download")
    @Operation(summary = "Baza zaxira nusxasini JSON fayl qilib yuklab olish")
    public ResponseEntity<byte[]> downloadBackup() {
        try {
            BackupData backupData = backupService.exportBackup();
            String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(backupData);
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"));
            String filename = "distributor_baza_backup_" + timestamp + ".json";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (Exception e) {
            log.error("Backup yuklashda xatolik:", e);
            throw new RuntimeException("Zaxira faylini tayyorlashda xatolik yuz berdi: " + e.getMessage());
        }
    }

    @org.springframework.beans.factory.annotation.Value("${app.security.user1.password:admin123}")
    private String user1Password;

    @org.springframework.beans.factory.annotation.Value("${app.security.user2.password:}")
    private String user2Password;

    @PostMapping(value = "/restore", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Zaxira faylidan bazani qayta tiklash")
    public ResponseEntity<Map<String, Object>> restoreBackup(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "password", required = false) String password) {

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Xavfsizlik talabi: Bazani qayta tiklash uchun administrator parolini kiritishingiz shart!"
            ));
        }

        boolean passwordValid = false;
        byte[] inputPasswordBytes = password.getBytes(StandardCharsets.UTF_8);

        if (user2Password != null && !user2Password.trim().isEmpty()) {
            byte[] user2PasswordBytes = user2Password.getBytes(StandardCharsets.UTF_8);
            if (MessageDigest.isEqual(inputPasswordBytes, user2PasswordBytes)) {
                passwordValid = true;
            }
        }
        if (!passwordValid && user1Password != null && !user1Password.trim().isEmpty()) {
            byte[] user1PasswordBytes = user1Password.getBytes(StandardCharsets.UTF_8);
            if (MessageDigest.isEqual(inputPasswordBytes, user1PasswordBytes)) {
                passwordValid = true;
            }
        }

        if (!passwordValid) {
            log.warn("Bazani tiklashda noto'g'ri administrator paroli kiritildi! User={}", uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Administrator paroli noto'g'ri kiritildi! Baza xavfsizligi ta'minlandi."
            ));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Fayl tanlanmagan yoki bo'sh"));
        }

        try {
            BackupData backupData = objectMapper.readValue(file.getInputStream(), BackupData.class);
            backupService.restoreBackup(backupData);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Baza muvaffaqiyatli tiklandi! Barcha do'konlar, qarzlar va tovarlar qayta tiklandi."
            ));
        } catch (Exception e) {
            log.error("Backup tiklashda xatolik:", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Zaxira fayli noto'g'ri formatda yoki fayl shikastlangan. Iltimos to'g'ri zaxira faylini yuklang."
            ));
        }
    }
}
