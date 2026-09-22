package uz.akmal.distributor_app.service.impl;

import lombok.extern.slf4j.Slf4j;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
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

        BigDecimal currentDebt = (shop.getCurrentDebt() != null) ? shop.getCurrentDebt() : BigDecimal.ZERO;
        shop.setCurrentDebt(currentDebt.subtract(request.getAmount()));
        shopRepository.save(shop);

        Payment payment = PaymentMapper.toEntity(request, shop);
        payment.setDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        log.info("To'lov qabul qilindi: shopId={}, amount={}, method={}, yangiQarz={}",
                shop.getId(), request.getAmount(), request.getMethod(), shop.getCurrentDebt());

        return PaymentMapper.toResponse(saved);
    }

    @Override
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getByShop(Long shopId) {
        return paymentRepository.findByShopId(shopId).stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }
}