package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class SupplyPaymentRequest {
    @NotNull(message = "To'lov summasi kiritilishi shart")
    @DecimalMin(value = "0.01", message = "To'lov summasi 0 dan katta bo'lishi kerak")
    private BigDecimal amount;

    private String paymentMethod = "NAQD"; // NAQD, KARTA, BANK

    private String paymentDate; // YYYY-MM-DD or ISO

    private String note;
}
