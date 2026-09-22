package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.dto.DashboardSummaryResponse;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import uz.akmal.distributor_app.dto.RangeReportResponse;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;
import uz.akmal.distributor_app.service.ExcelExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayInputStream;


@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ExcelExportService excelExportService;

    public ReportController(ReportService reportService, ExcelExportService excelExportService) {
        this.reportService = reportService;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/daily")
    public DailyReportResponse getDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reportService.getDailyReport(date);
    }

    @GetMapping("/monthly")
    public MonthlyReportResponse getMonthly(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return reportService.getMonthlyReport(month);
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return reportService.getDashboardSummary();
    }


    @GetMapping("/range")
    public RangeReportResponse getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return reportService.getRangeReport(start, end);
    }


    @GetMapping("/daily/export")
    public ResponseEntity<InputStreamResource> exportDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        ByteArrayInputStream in = excelExportService.exportDailyReport(date);

        String filename = "kunlik-hisobot-" + date + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }


    @GetMapping("/monthly/export")
    public ResponseEntity<InputStreamResource> exportMonthly(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        ByteArrayInputStream in = excelExportService.exportMonthlyReport(month);
        String filename = "oylik-hisobot-" + month + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);
        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/range/export")
    public ResponseEntity<InputStreamResource> exportRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        ByteArrayInputStream in = excelExportService.exportRangeReport(start, end);
        String filename = "oraliq-hisobot-" + start + "_" + end + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);
        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }



}