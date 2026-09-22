package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.dto.DashboardSummaryResponse;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import uz.akmal.distributor_app.dto.RangeReportResponse;

import java.time.LocalDate;
import java.time.YearMonth;

public interface ReportService {
    DailyReportResponse getDailyReport(LocalDate date);
    MonthlyReportResponse getMonthlyReport(YearMonth month);
    DashboardSummaryResponse getDashboardSummary();
    RangeReportResponse getRangeReport(LocalDate start, LocalDate end);
}