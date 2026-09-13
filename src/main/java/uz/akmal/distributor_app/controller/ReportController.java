package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
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



}