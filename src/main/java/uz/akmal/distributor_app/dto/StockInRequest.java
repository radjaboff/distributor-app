package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class StockInRequest {

    @NotNull(message = "Mahsulot (productId) ko'rsatilishi shart")
    private Long productId;

    @NotNull(message = "Paket soni ko'rsatilishi shart")
    @Positive(message = "Paket soni musbat son bo'lishi kerak")
    private Integer packageCount;

    @NotNull(message = "Umumiy narx ko'rsatilishi shart")
    @Positive(message = "Umumiy narx musbat son bo'lishi kerak")
    private BigDecimal totalCost;
}