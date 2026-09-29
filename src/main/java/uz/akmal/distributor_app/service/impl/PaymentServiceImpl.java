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
        Shop shop = shopRepository.findByIdWithLock(request.getShopId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi yoki o'chirilgan"));

        BigDecimal currentDebt = (shop.getCurrentDebt() != null) ? shop.getCurrentDebt() : BigDecimal.ZERO;
        shop.setCurrentDebt(currentDebt.subtract(request.getAmount()));
        shopRepository.save(shop);

        Payment payment = PaymentMapper.toEntity(request, shop);
        payment.setDate(LocalDateTime.now());
        payment.setCreatedBy(uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());

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

    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long id, String reason) {
        Payment payment = paymentRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("To'lov topilmadi, id: " + id));

        if (Boolean.TRUE.equals(payment.getIsCancelled())) {
            throw new IllegalStateException("Ushbu to'lov allaqachon bekor qilingan (ID: " + id + ")");
        }

        if (payment.getSale() != null) {
            throw new IllegalArgumentException("Ushbu to'lov #" + payment.getSale().getId() +
                    "-sonli sotuv boshlang'ich to'lovi hisoblanadi. Uni bekor qilish uchun sotuvning o'zini bekor qiling.");
        }

        Shop shop = shopRepository.findByIdForUpdate(payment.getShop().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi: id=" + payment.getShop().getId()));

        String currentUser = uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername();
        String cancelReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "To'lov bekor qilindi";
        LocalDateTime now = LocalDateTime.now();

        log.info("To'lovni bekor qilish (Storno) boshlandi: paymentId={}, shopId={}, amount={}",
                id, shop.getId(), payment.getAmount());

        BigDecimal currentDebt = (shop.getCurrentDebt() != null) ? shop.getCurrentDebt() : BigDecimal.ZERO;
        shop.setCurrentDebt(currentDebt.add(payment.getAmount()));
        shopRepository.save(shop);

        payment.setIsCancelled(true);
        payment.setCancelReason(cancelReason);
        payment.setCancelledAt(now);
        payment.setCancelledBy(currentUser);
        Payment saved = paymentRepository.save(payment);

        log.info("To'lov muvaffaqiyatli bekor qilindi (Storno): paymentId={}, yangiQarz={}, bekorQildi={}",
                id, shop.getCurrentDebt(), currentUser);

        return PaymentMapper.toResponse(saved);
    }
}