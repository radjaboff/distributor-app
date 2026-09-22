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
public class RangeReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalSalesAmount;
    private BigDecimal totalProfit;
    private Map<PaymentType, BigDecimal> revenueByType;
    private List<MonthlyReportResponse.TopShop> topDebtorShops;
    private List<MonthlyReportResponse.ProductVolume> productSalesVolume;
    private BigDecimal totalStockInCost;
    private List<MonthlyReportResponse.StockInVolume> stockInVolume;

}