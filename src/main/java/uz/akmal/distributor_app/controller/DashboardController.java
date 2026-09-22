package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.DashboardSummaryResponse;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ReportService reportService;

    public DashboardController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {
        return reportService.getDashboardSummary();
    }
}