package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.Digits;
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
    @jakarta.validation.constraints.Max(value = 1000000, message = "Bir martalik paket soni 1 000 000 dan oshmasligi kerak")
    private Integer packageCount;

    @NotNull(message = "Umumiy narx ko'rsatilishi shart")
    @Positive(message = "Umumiy narx musbat son bo'lishi kerak")
    @Digits(integer = 13, fraction = 2, message = "Umumiy narx formati noto'g'ri (maksimal 13 butun va 2 kasr xona)")
    private BigDecimal totalCost;
}