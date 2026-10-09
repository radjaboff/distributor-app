package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.entity.Shop;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequest request, Shop shop) {
        Payment payment = new Payment();
        payment.setShop(shop);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setNote(request.getNote() != null && !request.getNote().trim().isEmpty() ? request.getNote().trim() : null);
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
        response.setNote(payment.getNote());
        response.setCreatedBy(payment.getCreatedBy() != null && !payment.getCreatedBy().trim().isEmpty() ? payment.getCreatedBy() : "admin");
        response.setSaleId(payment.getSale() != null ? payment.getSale().getId() : null);
        response.setIsCancelled(Boolean.TRUE.equals(payment.getIsCancelled()));
        response.setCancelReason(payment.getCancelReason());
        response.setCancelledAt(payment.getCancelledAt());
        response.setCancelledBy(payment.getCancelledBy());
        return response;
    }
}