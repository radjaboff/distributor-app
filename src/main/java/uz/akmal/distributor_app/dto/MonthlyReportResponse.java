package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Getter
@Setter
public class MonthlyReportResponse {
    private YearMonth month;
    private BigDecimal totalSalesAmount;
    private BigDecimal totalProfit;
    private List<TopShop> topDebtorShops;
    private List<ProductVolume> productSalesVolume;

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
}