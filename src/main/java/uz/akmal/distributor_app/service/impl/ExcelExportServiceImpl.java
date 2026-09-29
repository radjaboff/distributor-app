package uz.akmal.distributor_app.service.impl;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import uz.akmal.distributor_app.dto.DailyReportResponse;
import uz.akmal.distributor_app.service.ExcelExportService;
import uz.akmal.distributor_app.service.ReportService;
import org.springframework.stereotype.Service;
import uz.akmal.distributor_app.dto.MonthlyReportResponse;
import uz.akmal.distributor_app.dto.RangeReportResponse;
import java.time.YearMonth;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    private final ReportService reportService;

    public ExcelExportServiceImpl(ReportService reportService) {
        this.reportService = reportService;
    }

    @Override
    public ByteArrayInputStream exportDailyReport(LocalDate date) {
        DailyReportResponse report = reportService.getDailyReport(date);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 1-varaq: Sotuvlar
            Sheet salesSheet = workbook.createSheet("Sotuvlar");
            Row salesHeader = salesSheet.createRow(0);
            String[] salesCols = {"Do'kon", "Summa", "To'lov turi"};
            for (int i = 0; i < salesCols.length; i++) {
                Cell cell = salesHeader.createCell(i);
                cell.setCellValue(salesCols[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowNum = 1;
            for (var sale : report.getSales()) {
                Row row = salesSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(sale.getShopName());
                row.createCell(1).setCellValue(sale.getAmount().doubleValue());
                row.createCell(2).setCellValue(sale.getPaymentType().toString());
            }
            for (int i = 0; i < salesCols.length; i++) salesSheet.autoSizeColumn(i);

            // 2-varaq: To'lovlar
            Sheet paymentsSheet = workbook.createSheet("To'lovlar");
            Row paymentsHeader = paymentsSheet.createRow(0);
            String[] paymentCols = {"Do'kon", "Summa"};
            for (int i = 0; i < paymentCols.length; i++) {
                Cell cell = paymentsHeader.createCell(i);
                cell.setCellValue(paymentCols[i]);
                cell.setCellStyle(headerStyle);
            }
            rowNum = 1;
            for (var payment : report.getPayments()) {
                Row row = paymentsSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(payment.getShopName());
                row.createCell(1).setCellValue(payment.getAmount().doubleValue());
            }
            for (int i = 0; i < paymentCols.length; i++) paymentsSheet.autoSizeColumn(i);

            // 3-varaq: Umumiy
            Sheet summarySheet = workbook.createSheet("Umumiy");
            String dateStr = date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
            summarySheet.createRow(0).createCell(0).setCellValue("Sana: " + dateStr);
            summarySheet.createRow(1).createCell(0).setCellValue("Kunlik sof foyda: " + report.getDailyProfit());
            summarySheet.createRow(2).createCell(0).setCellValue("Bugungi kirim xarajati: " + (report.getTotalStockInCost() != null ? report.getTotalStockInCost() : java.math.BigDecimal.ZERO));
            summarySheet.createRow(3).createCell(0).setCellValue("Umumiy qarz (barcha): " + report.getTotalDebtAllShops());
            if (report.getRevenueByType() != null) {
                summarySheet.createRow(4).createCell(0).setCellValue("Undirilgan to'lov (NAQD): " + report.getRevenueByType().getOrDefault(uz.akmal.distributor_app.enums.PaymentType.NAQD, java.math.BigDecimal.ZERO));
                summarySheet.createRow(5).createCell(0).setCellValue("Undirilgan to'lov (KARTA): " + report.getRevenueByType().getOrDefault(uz.akmal.distributor_app.enums.PaymentType.KARTA, java.math.BigDecimal.ZERO));
                summarySheet.createRow(6).createCell(0).setCellValue("Nasiyaga berilgan savdo (NASIYA): " + report.getRevenueByType().getOrDefault(uz.akmal.distributor_app.enums.PaymentType.NASIYA, java.math.BigDecimal.ZERO));
            }
            summarySheet.autoSizeColumn(0);

            // 4-varaq: Ombor kirimlari
            if (report.getStockIns() != null && !report.getStockIns().isEmpty()) {
                Sheet stockSheet = workbook.createSheet("Ombor kirimlari");
                Row stockHeader = stockSheet.createRow(0);
                String[] stockCols = {"Mahsulot", "Paket soni", "Jami tannarx", "Kiritgan admin"};
                for (int i = 0; i < stockCols.length; i++) {
                    Cell cell = stockHeader.createCell(i);
                    cell.setCellValue(stockCols[i]);
                    cell.setCellStyle(headerStyle);
                }
                int sRowNum = 1;
                for (var si : report.getStockIns()) {
                    Row row = stockSheet.createRow(sRowNum++);
                    row.createCell(0).setCellValue(si.getProductName());
                    row.createCell(1).setCellValue(si.getPackageCount());
                    row.createCell(2).setCellValue(si.getTotalCost() != null ? si.getTotalCost().doubleValue() : 0);
                    row.createCell(3).setCellValue(si.getCreatedBy() != null ? si.getCreatedBy() : "admin");
                }
                for (int i = 0; i < stockCols.length; i++) stockSheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Excel fayl yaratishda xatolik: " + e.getMessage());
        }
    }


    @Override
    public ByteArrayInputStream exportMonthlyReport(YearMonth month) {
        MonthlyReportResponse report = reportService.getMonthlyReport(month);
        return buildWorkbook(
                "Oylik hisobot: " + month,
                report.getTotalSalesAmount(),
                report.getTotalProfit(),
                report.getTotalStockInCost(),
                report.getRevenueByType(),
                report.getTopDebtorShops(),
                report.getProductSalesVolume(),
                report.getStockInVolume()
        );
    }

    @Override
    public ByteArrayInputStream exportRangeReport(LocalDate start, LocalDate end) {
        RangeReportResponse report = reportService.getRangeReport(start, end);
        return buildWorkbook(
                "Oraliq hisobot: " + start + " — " + end,
                report.getTotalSalesAmount(),
                report.getTotalProfit(),
                report.getTotalStockInCost(),
                report.getRevenueByType(),
                report.getTopDebtorShops(),
                report.getProductSalesVolume(),
                report.getStockInVolume()
        );
    }

    private ByteArrayInputStream buildWorkbook(
            String title,
            java.math.BigDecimal totalSales,
            java.math.BigDecimal totalProfit,
            java.math.BigDecimal totalStockInCost,
            java.util.Map<uz.akmal.distributor_app.enums.PaymentType, java.math.BigDecimal> revenueByType,
            java.util.List<MonthlyReportResponse.TopShop> topShops,
            java.util.List<MonthlyReportResponse.ProductVolume> productVolumes,
            java.util.List<MonthlyReportResponse.StockInVolume> stockInVolumes
    ) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 1-varaq: Umumiy
            Sheet summarySheet = workbook.createSheet("Umumiy");
            summarySheet.createRow(0).createCell(0).setCellValue(title);
            summarySheet.createRow(1).createCell(0).setCellValue("Umumiy sotuv: " + totalSales);
            summarySheet.createRow(2).createCell(0).setCellValue("Umumiy sof foyda: " + totalProfit);
            summarySheet.createRow(3).createCell(0).setCellValue("Jami kirim xarajati: " + (totalStockInCost != null ? totalStockInCost : java.math.BigDecimal.ZERO));
            if (revenueByType != null) {
                summarySheet.createRow(4).createCell(0).setCellValue("Undirilgan to'lov (NAQD): " + revenueByType.getOrDefault(uz.akmal.distributor_app.enums.PaymentType.NAQD, java.math.BigDecimal.ZERO));
                summarySheet.createRow(5).createCell(0).setCellValue("Undirilgan to'lov (KARTA): " + revenueByType.getOrDefault(uz.akmal.distributor_app.enums.PaymentType.KARTA, java.math.BigDecimal.ZERO));
                summarySheet.createRow(6).createCell(0).setCellValue("Nasiyaga berilgan savdo (NASIYA): " + revenueByType.getOrDefault(uz.akmal.distributor_app.enums.PaymentType.NASIYA, java.math.BigDecimal.ZERO));
            }
            summarySheet.autoSizeColumn(0);

            // 2-varaq: TOP qarzdorlar
            Sheet topSheet = workbook.createSheet("TOP qarzdorlar");
            Row topHeader = topSheet.createRow(0);
            topHeader.createCell(0).setCellValue("Do'kon");
            topHeader.createCell(1).setCellValue("Qarz");
            topHeader.getCell(0).setCellStyle(headerStyle);
            topHeader.getCell(1).setCellStyle(headerStyle);
            int r = 1;
            if (topShops != null) {
                for (var shop : topShops) {
                    Row row = topSheet.createRow(r++);
                    row.createCell(0).setCellValue(shop.getShopName());
                    row.createCell(1).setCellValue(shop.getCurrentDebt() != null ? shop.getCurrentDebt().doubleValue() : 0);
                }
            }
            topSheet.autoSizeColumn(0);
            topSheet.autoSizeColumn(1);

            // 3-varaq: Mahsulot bo'yicha sotuv
            Sheet productSheet = workbook.createSheet("Mahsulot boyicha sotuv");
            Row prodHeader = productSheet.createRow(0);
            prodHeader.createCell(0).setCellValue("Mahsulot");
            prodHeader.createCell(1).setCellValue("Sotilgan paket");
            prodHeader.getCell(0).setCellStyle(headerStyle);
            prodHeader.getCell(1).setCellStyle(headerStyle);
            r = 1;
            if (productVolumes != null) {
                for (var pv : productVolumes) {
                    Row row = productSheet.createRow(r++);
                    row.createCell(0).setCellValue(pv.getProductName());
                    row.createCell(1).setCellValue(pv.getTotalPackagesSold());
                }
            }
            productSheet.autoSizeColumn(0);
            productSheet.autoSizeColumn(1);

            // 4-varaq: Ombor kirimlari (hajm)
            if (stockInVolumes != null && !stockInVolumes.isEmpty()) {
                Sheet stockVolSheet = workbook.createSheet("Ombor kirimlari (hajm)");
                Row stockVolHeader = stockVolSheet.createRow(0);
                stockVolHeader.createCell(0).setCellValue("Mahsulot");
                stockVolHeader.createCell(1).setCellValue("Kirim qilingan paket");
                stockVolHeader.getCell(0).setCellStyle(headerStyle);
                stockVolHeader.getCell(1).setCellStyle(headerStyle);
                int sr = 1;
                for (var sv : stockInVolumes) {
                    Row row = stockVolSheet.createRow(sr++);
                    row.createCell(0).setCellValue(sv.getProductName());
                    row.createCell(1).setCellValue(sv.getTotalPackagesReceived());
                }
                stockVolSheet.autoSizeColumn(0);
                stockVolSheet.autoSizeColumn(1);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Excel fayl yaratishda xatolik: " + e.getMessage());
        }
    }



}