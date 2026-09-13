package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarketGroupRequest {

    @NotBlank(message = "Toifa nomi bo'sh bo'lishi mumkin emas")
    private String name;
}