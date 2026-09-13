package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String unit;
    private String packageName;
    private BigDecimal unitsPerPackage;
    private BigDecimal purchasePrice;
    private BigDecimal sellPrice;
    private Integer stockQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}