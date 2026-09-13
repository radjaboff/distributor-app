package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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

    private BigDecimal initialPaidAmount;

    private PaymentMethod initialPaymentMethod;
}