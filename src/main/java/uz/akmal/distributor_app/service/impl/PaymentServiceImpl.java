package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.PaymentMapper;
import uz.akmal.distributor_app.dto.PaymentRequest;
import uz.akmal.distributor_app.dto.PaymentResponse;
import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.PaymentRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ShopRepository shopRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, ShopRepository shopRepository) {
        this.paymentRepository = paymentRepository;
        this.shopRepository = shopRepository;
    }

    @Override
    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi"));

        shop.setCurrentDebt(shop.getCurrentDebt().subtract(request.getAmount()));
        shopRepository.save(shop);

        Payment payment = PaymentMapper.toEntity(request, shop);
        payment.setDate(LocalDateTime.now());

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getByShop(Long shopId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getShop().getId().equals(shopId))
                .map(PaymentMapper::toResponse)
                .toList();
    }
}