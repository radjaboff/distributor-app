package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DashboardSummaryResponse {
    private BigDecimal totalDebtAllShops;
    private BigDecimal todaysSalesTotal;
    private BigDecimal todaysProfit;
    private List<LowStockProduct> lowStockProducts;

    @Getter
    @Setter
    public static class LowStockProduct {
        private String productName;
        private Integer stockQuantity;
    }
}