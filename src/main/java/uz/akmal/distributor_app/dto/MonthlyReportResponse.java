package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import uz.akmal.distributor_app.enums.PaymentType;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class MonthlyReportResponse {
    private YearMonth month;
    private BigDecimal totalSalesAmount;
    private BigDecimal totalProfit;
    private List<TopShop> topDebtorShops;
    private List<ProductVolume> productSalesVolume;
    private Map<PaymentType, BigDecimal> revenueByType;
    private BigDecimal totalStockInCost;
    private List<StockInVolume> stockInVolume;

    @Getter
    @Setter
    public static class TopShop {
        private String shopName;
        private BigDecimal currentDebt;
    }

    @Getter
    @Setter
    public static class ProductVolume {
        private String productName;
        private Integer totalPackagesSold;
    }

    @Getter
    @Setter
    public static class StockInVolume {
        private String productName;
        private Integer totalPackagesReceived;
    }
}