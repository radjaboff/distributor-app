package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierLedgerEntryResponse {
    private Long id;
    private String type; // KIRIM or TOLOV
    private LocalDateTime date;
    private String productName;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private String paymentMethod;
    private String note;
    private BigDecimal balanceAfter;
    private Boolean isCancelled;
    private String cancelReason;
    private String cancelledBy;
    private String createdBy;
    private BigDecimal litersPerItem;
    private Integer itemsPerBox;
    private Integer boxesCount;
    private BigDecimal pricePerLiter;
    private BigDecimal totalLiters;
}
