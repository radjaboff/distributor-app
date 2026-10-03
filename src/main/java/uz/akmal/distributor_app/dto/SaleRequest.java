package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class SaleRequest {

    @NotNull(message = "Do'kon (shopId) ko'rsatilishi shart")
    private Long shopId;

    @NotEmpty(message = "Kamida bitta mahsulot bo'lishi kerak")
    @Valid
    private List<SaleItemRequest> items;

    @PositiveOrZero(message = "Boshlang'ich to'lov manfiy bo'lishi mumkin emas")
    @Digits(integer = 13, fraction = 2, message = "Boshlang'ich to'lov formati noto'g'ri (maksimal 13 butun va 2 kasr xona)")
    private BigDecimal initialPaidAmount;

    private PaymentMethod initialPaymentMethod;

    private String saleDate;
}