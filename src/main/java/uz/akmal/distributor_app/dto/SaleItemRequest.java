package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaleItemRequest {

    @NotNull(message = "Mahsulot (productId) ko'rsatilishi shart")
    private Long productId;

    @NotNull(message = "Paket soni ko'rsatilishi shart")
    @Positive(message = "Paket soni musbat son bo'lishi kerak")
    private Integer packageCount;

    @NotNull(message = "Mahsulot narxi kiritilishi shart")
    @Positive(message = "Narx musbat son bo'lishi kerak")
    private java.math.BigDecimal price;
}