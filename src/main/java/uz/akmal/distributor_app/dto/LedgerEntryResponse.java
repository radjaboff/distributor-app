package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class LedgerEntryResponse {
    private Long id;
    private LocalDateTime date;
    private String type; // "SOTUV" yoki "TOLOV"
    private String description;
    private String note;
    private BigDecimal amount;
    private BigDecimal balanceAfter; // shu amaldan keyingi qoldiq qarz
    private String createdBy; // amaliyotni bajargan admin
    private BigDecimal initialPaidAmount;
    private String paymentMethod;
    private Boolean isCancelled;
    private String cancelReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private List<SaleItemDetailDto> items;

    @Getter
    @Setter
    public static class SaleItemDetailDto {
        private String productName;
        private Integer packageCount;
        private BigDecimal price;
        private BigDecimal total;
    }
}