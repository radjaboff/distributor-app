package uz.akmal.distributor_app.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.distributor_app.util.SecurityUtils;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Foydalanuvchi ma'lumotlari")
public class AuthController {

    @GetMapping("/me")
    @Operation(summary = "Hozirgi tizimga kirgan foydalanuvchini olish")
    public Map<String, String> getCurrentUser() {
        return Map.of("username", SecurityUtils.getCurrentUsername());
    }
}
