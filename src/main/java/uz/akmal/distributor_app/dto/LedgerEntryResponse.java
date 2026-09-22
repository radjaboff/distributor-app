package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class LedgerEntryResponse {
    private LocalDateTime date;
    private String type; // "SOTUV" yoki "TOLOV"
    private String description;
    private BigDecimal amount;
    private BigDecimal balanceAfter; // shu amaldan keyingi qoldiq qarz
}