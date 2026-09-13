package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Mahsulot nomi bo'sh bo'lishi mumkin emas")
    private String name;

    private String unit;

    @NotBlank(message = "Qadoq turi ko'rsatilishi shart")
    private String packageName;

    private BigDecimal unitsPerPackage;

    @NotNull(message = "Tannarx ko'rsatilishi shart")
    @Positive(message = "Tannarx musbat son bo'lishi kerak")
    private BigDecimal purchasePrice;

    @NotNull(message = "Sotish narxi ko'rsatilishi shart")
    @Positive(message = "Sotish narxi musbat son bo'lishi kerak")
    private BigDecimal sellPrice;
}