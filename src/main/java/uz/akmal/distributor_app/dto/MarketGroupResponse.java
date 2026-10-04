package uz.akmal.distributor_app.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class MarketGroupResponse {
    private Long id;
    private String name;
    private Integer shopCount = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
