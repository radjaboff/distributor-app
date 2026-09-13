package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.PaymentRequest;
import uz.akmal.distributor_app.dto.PaymentResponse;
import uz.akmal.distributor_app.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public PaymentResponse create(@Valid @RequestBody PaymentRequest request) {
        return paymentService.create(request);
    }

    @GetMapping
    public List<PaymentResponse> getAll(@RequestParam(required = false) Long shopId) {
        if (shopId != null) {
            return paymentService.getByShop(shopId);
        }
        return paymentService.getAll();
    }
}