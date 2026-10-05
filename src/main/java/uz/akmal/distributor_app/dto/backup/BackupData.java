package uz.akmal.distributor_app.dto.backup;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.akmal.distributor_app.enums.PaymentMethod;
import uz.akmal.distributor_app.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupData {
    private String appName;
    private String version;
    private LocalDateTime backupDate;
    private String createdBy;

    private List<MarketGroupDto> marketGroups;
    private List<ProductDto> products;
    private List<ShopDto> shops;
    private List<StockInDto> stockIns;
    private List<SaleDto> sales;
    private List<PaymentDto> payments;
    private List<SupplierDto> suppliers;
    private List<SupplyPurchaseDto> supplyPurchases;
    private List<SupplyPaymentDto> supplyPayments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketGroupDto {
        private Long id;
        private String name;
        private Boolean isDeleted;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDto {
        private Long id;
        private String name;
        private String unit;
        private String packageName;
        private BigDecimal unitsPerPackage;
        private BigDecimal purchasePrice;
        private BigDecimal sellPrice;
        private Integer stockQuantity;
        private Boolean isDeleted;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopDto {
        private Long id;
        private String name;
        private String ownerName;
        private String phone;
        private BigDecimal currentDebt;
        private Long marketGroupId;
        private Boolean isDeleted;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockInDto {
        private Long id;
        private Long productId;
        private String productName;
        private Integer packageCount;
        private BigDecimal totalCost;
        private LocalDateTime date;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleDto {
        private Long id;
        private Long shopId;
        private LocalDateTime date;
        private BigDecimal initialPaidAmount;
        private PaymentType paymentType;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;
        private String createdBy;
        private Boolean isCancelled;
        private String cancelReason;
        private LocalDateTime cancelledAt;
        private String cancelledBy;
        private List<SaleItemDto> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private Integer packageCount;
        private BigDecimal priceAtSale;
        private BigDecimal costAtSale;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDto {
        private Long id;
        private Long shopId;
        private Long saleId;
        private BigDecimal amount;
        private PaymentMethod method;
        private LocalDateTime date;
        private LocalDateTime createdAt;
        private String createdBy;
        private Boolean isCancelled;
        private String cancelReason;
        private LocalDateTime cancelledAt;
        private String cancelledBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierDto {
        private Long id;
        private String name;
        private String phone;
        private String category;
        private BigDecimal currentDebt;
        private Boolean active;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyPurchaseDto {
        private Long id;
        private Long supplierId;
        private String category;
        private String productName;
        private String unit;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalAmount;
        private LocalDateTime purchaseDate;
        private String note;
        private BigDecimal litersPerItem;
        private Integer itemsPerBox;
        private Integer boxesCount;
        private BigDecimal pricePerLiter;
        private BigDecimal totalLiters;
        private Boolean isCancelled;
        private String cancelReason;
        private String cancelledBy;
        private LocalDateTime cancelledAt;
        private LocalDateTime createdAt;
        private String createdBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyPaymentDto {
        private Long id;
        private Long supplierId;
        private BigDecimal amount;
        private String paymentMethod;
        private LocalDateTime paymentDate;
        private String note;
        private Boolean isCancelled;
        private String cancelReason;
        private String cancelledBy;
        private LocalDateTime cancelledAt;
        private LocalDateTime createdAt;
        private String createdBy;
    }
}
