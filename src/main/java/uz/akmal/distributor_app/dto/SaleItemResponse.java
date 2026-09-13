package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class SaleItemResponse {
    private Long productId;
    private String productName;
    private Integer packageCount;
    private BigDecimal priceAtSale;
    private BigDecimal costAtSale;
}