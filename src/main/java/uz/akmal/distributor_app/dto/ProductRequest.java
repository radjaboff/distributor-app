package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.Digits;
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

    private String packageName;

    @Positive(message = "Birliklar soni musbat son bo'lishi kerak")
    @Digits(integer = 12, fraction = 3, message = "Birliklar soni noto'g'ri (maksimal 12 butun va 3 kasr xona)")
    private BigDecimal unitsPerPackage;

    @Positive(message = "Tannarx musbat son bo'lishi kerak")
    @Digits(integer = 13, fraction = 2, message = "Tannarx formati noto'g'ri (maksimal 13 butun va 2 kasr xona)")
    private BigDecimal purchasePrice;

    @Positive(message = "Sotish narxi musbat son bo'lishi kerak")
    @Digits(integer = 13, fraction = 2, message = "Sotish narxi formati noto'g'ri (maksimal 13 butun va 2 kasr xona)")
    private BigDecimal sellPrice;
}