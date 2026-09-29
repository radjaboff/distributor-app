package uz.akmal.distributor_app.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CancelRequest {
    @Size(max = 500, message = "Sabab 500 belgidan oshmasligi kerak")
    private String reason;
}
