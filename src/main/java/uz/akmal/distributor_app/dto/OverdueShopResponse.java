package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OverdueShopResponse {
    private Long shopId;
    private String shopName;
    private BigDecimal currentDebt;
    private Integer daysSinceLastPayment;
    private LocalDateTime lastPaymentDate;
}