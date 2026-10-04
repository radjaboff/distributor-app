package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierLedgerResponse {
    private Long supplierId;
    private String supplierName;
    private String phone;
    private String category;
    private BigDecimal currentDebt;
    private BigDecimal totalPurchasedAmount;
    private BigDecimal totalPaidAmount;
    private List<SupplierLedgerEntryResponse> entries;
}
