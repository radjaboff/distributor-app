package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class SupplyPurchaseRequest {
    @NotBlank(message = "Mahsulot nomi kiritilishi shart")
    private String productName;

    @NotBlank(message = "O'lchov birligi (Qop, Tonna yoki Kg) tanlanishi shart")
    private String unit; // QOP, TONNA, KG

    @NotNull(message = "Miqdori kiritilishi shart")
    @DecimalMin(value = "0.001", message = "Miqdori 0 dan katta bo'lishi kerak")
    private BigDecimal quantity;

    @NotNull(message = "Birlik narxi kiritilishi shart")
    @DecimalMin(value = "1", message = "Birlik narxi 0 dan katta bo'lishi kerak")
    private BigDecimal unitPrice;

    private String purchaseDate; // YYYY-MM-DD or ISO

    private String note;
}
