package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class StockInResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer packageCount;
    private BigDecimal totalCost;
    private LocalDateTime date;
    private LocalDateTime createdAt;
}