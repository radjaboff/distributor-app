package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShopRequest {

    @NotBlank(message = "Do'kon nomi bo'sh bo'lishi mumkin emas")
    private String name;

    private String ownerName;

    private String phone;

    @NotNull(message = "Toifa (marketGroupId) ko'rsatilishi shart")
    private Long marketGroupId;
}