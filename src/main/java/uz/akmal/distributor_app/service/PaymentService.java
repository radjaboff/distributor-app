package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.PaymentRequest;
import uz.akmal.distributor_app.dto.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse create(PaymentRequest request);
    List<PaymentResponse> getAll();
    List<PaymentResponse> getByShop(Long shopId);
}