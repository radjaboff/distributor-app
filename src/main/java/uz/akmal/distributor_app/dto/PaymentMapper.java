package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.entity.Shop;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequest request, Shop shop) {
        Payment payment = new Payment();
        payment.setShop(shop);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        return payment;
    }

    public static PaymentResponse toResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setShopId(payment.getShop().getId());
        response.setShopName(payment.getShop().getName());
        response.setAmount(payment.getAmount());
        response.setMethod(payment.getMethod());
        response.setDate(payment.getDate());
        return response;
    }
}