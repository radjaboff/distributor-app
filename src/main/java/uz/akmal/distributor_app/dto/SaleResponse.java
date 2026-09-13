package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.enums.PaymentType;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class SaleResponse {
    private Long id;
    private Long shopId;
    private String shopName;
    private LocalDateTime date;
    private PaymentType paymentType;
    private BigDecimal totalAmount;
    private List<SaleItemResponse> items;
}