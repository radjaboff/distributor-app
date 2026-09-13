package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ShopResponse {
    private Long id;
    private String name;
    private String ownerName;
    private String phone;
    private BigDecimal currentDebt;
    private Long marketGroupId;
    private String marketGroupName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}