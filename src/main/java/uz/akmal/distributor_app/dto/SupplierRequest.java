package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {
    @NotBlank(message = "Ta'minotchi yoki birja nomi kiritilishi shart")
    private String name;

    private String phone;

    @jakarta.validation.constraints.Pattern(regexp = "^(?i)(SHAKAR|YOG)$", message = "Kategoriya faqat SHAKAR yoki YOG bo'lishi kerak")
    private String category = "SHAKAR";
}
