package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentType;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DailyReportResponse {
    private LocalDate date;
    private BigDecimal totalSalesAmount;
    private List<SaleSummary> sales;
    private List<PaymentSummary> payments;
    private BigDecimal dailyProfit;
    private Map<PaymentType, BigDecimal> revenueByType;
    private BigDecimal totalDebtAllShops;
    private java.math.BigDecimal totalStockInCost;
    private List<StockInSummary> stockIns;

    @Getter
    @Setter
    public static class SaleSummary {
        private String shopName;
        private BigDecimal amount;
        private PaymentType paymentType;
        private String createdBy;
    }

    @Getter
    @Setter
    public static class PaymentSummary {
        private String shopName;
        private BigDecimal amount;
        private String createdBy;
    }


    @Getter
    @Setter
    public static class StockInSummary {
        private String productName;
        private Integer packageCount;
        private java.math.BigDecimal totalCost;
        private String createdBy;
    }
}