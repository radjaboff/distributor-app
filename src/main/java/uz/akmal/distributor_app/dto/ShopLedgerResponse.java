package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ShopLedgerResponse {
    private Long shopId;
    private String shopName;
    private BigDecimal currentDebt;
    private List<LedgerEntryResponse> entries;
}
