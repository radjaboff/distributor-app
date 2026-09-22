package uz.akmal.distributor_app.service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.YearMonth;

public interface ExcelExportService {
    ByteArrayInputStream exportDailyReport(LocalDate date);
    ByteArrayInputStream exportMonthlyReport(YearMonth month);
    ByteArrayInputStream exportRangeReport(LocalDate start, LocalDate end);
}