package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentMethod;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "Do'kon (shopId) ko'rsatilishi shart")
    private Long shopId;

    @NotNull(message = "Summa ko'rsatilishi shart")
    @Positive(message = "Summa musbat son bo'lishi kerak")
    @Digits(integer = 13, fraction = 2, message = "Summa formati noto'g'ri (maksimal 13 butun va 2 kasr xona)")
    private BigDecimal amount;

    @NotNull(message = "To'lov usuli ko'rsatilishi shart")
    private PaymentMethod method;

    private String paymentDate;

    private String note;
}