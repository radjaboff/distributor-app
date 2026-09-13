package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {
    private Long id;
    private Long shopId;
    private String shopName;
    private BigDecimal amount;
    private PaymentMethod method;
    private LocalDateTime date;
}