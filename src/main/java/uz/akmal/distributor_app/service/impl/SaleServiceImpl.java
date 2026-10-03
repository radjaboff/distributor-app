package uz.akmal.distributor_app.service.impl;

import lombok.extern.slf4j.Slf4j;
import uz.akmal.distributor_app.dto.*;
import uz.akmal.distributor_app.entity.*;
import uz.akmal.distributor_app.enums.PaymentMethod;
import uz.akmal.distributor_app.enums.PaymentType;
import uz.akmal.distributor_app.exception.InsufficientStockException;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.*;
import uz.akmal.distributor_app.service.SaleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.distributor_app.exception.InvalidPaymentException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final PaymentRepository paymentRepository;

    public SaleServiceImpl(SaleRepository saleRepository,
                           ProductRepository productRepository,
                           ShopRepository shopRepository,
                           PaymentRepository paymentRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest request) {

        Shop shop = shopRepository.findByIdWithLock(request.getShopId())
                .filter(s -> !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi yoki o'chirilgan"));

        log.info("Yangi sotuv boshlandi (qulflangan): shopId={}", request.getShopId());

        // Mahsulotlar ma'lumotlarini bazadan o'qiymiz (ombor qoldig'i hisoblanmagani sababli qulflash shart emas)
        java.util.List<Long> productIds = request.getItems().stream()
                .map(SaleItemRequest::getProductId)
                .distinct()
                .toList();

        java.util.Map<Long, Product> productMap = new java.util.HashMap<>();
        for (Long pId : productIds) {
            Product product = productRepository.findById(pId)
                    .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                    .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan: ID=" + pId));
            productMap.put(pId, product);
        }

        Sale sale = new Sale();
        sale.setShop(shop);
        LocalDateTime saleDateTime = LocalDateTime.now();
        if (request.getSaleDate() != null && !request.getSaleDate().trim().isEmpty()) {
            String dateStr = request.getSaleDate().trim();
            if (dateStr.length() == 10) {
                saleDateTime = java.time.LocalDate.parse(dateStr).atTime(java.time.LocalTime.now());
            } else {
                try {
                    saleDateTime = LocalDateTime.parse(dateStr);
                } catch (Exception e) {
                    saleDateTime = java.time.LocalDate.parse(dateStr.substring(0, 10)).atTime(java.time.LocalTime.now());
                }
            }
        }
        LocalDate saleDateOnly = saleDateTime.toLocalDate();
        if (saleDateOnly.isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Sotuv sanasi bugungi kundan keyingi (kelajak) bo'lishi mumkin emas");
        }
        sale.setDate(saleDateTime);
        sale.setCreatedBy(uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productMap.get(itemRequest.getProductId());

            BigDecimal unitPrice = itemRequest.getPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                if (product.getSellPrice() != null && product.getSellPrice().compareTo(BigDecimal.ZERO) > 0) {
                    unitPrice = product.getSellPrice();
                } else {
                    throw new IllegalArgumentException("Mahsulot (" + product.getName() + ") narxi kiritilishi va 0 dan katta bo'lishi shart");
                }
            }

            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setSale(sale);
            item.setPackageCount(itemRequest.getPackageCount());
            item.setPriceAtSale(unitPrice);
            item.setCostAtSale(BigDecimal.ZERO);

            sale.getItems().add(item);

            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getPackageCount()));
            totalAmount = totalAmount.add(lineTotal);
        }

        sale.setTotalAmount(totalAmount);


        BigDecimal paidAmount = (request.getInitialPaidAmount() == null) ? BigDecimal.ZERO : request.getInitialPaidAmount();

        if (paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidPaymentException("Boshlang'ich to'lov manfiy bo'lishi mumkin emas");
        }

        if (paidAmount.compareTo(totalAmount) > 0) {
            throw new InvalidPaymentException("Boshlang'ich to'lov jami sotuv summasidan ko'p bo'lishi mumkin emas");
        }

        sale.setInitialPaidAmount(paidAmount);

        if (paidAmount.compareTo(BigDecimal.ZERO) > 0 && request.getInitialPaymentMethod() == null) {
            throw new InvalidPaymentException("To'lov summasi kiritilgan bo'lsa, to'lov usuli (initialPaymentMethod) ham ko'rsatilishi shart");
        }

        if (paidAmount.compareTo(totalAmount) >= 0) {
            sale.setPaymentType(
                    request.getInitialPaymentMethod() == PaymentMethod.KARTA ? PaymentType.KARTA : PaymentType.NAQD
            );
        } else {
            sale.setPaymentType(PaymentType.NASIYA);
        }

        Sale savedSale = saleRepository.save(sale);

        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = new Payment();
            payment.setShop(shop);
            payment.setSale(savedSale);
            payment.setAmount(paidAmount);
            payment.setMethod(request.getInitialPaymentMethod());
            payment.setDate(sale.getDate());
            payment.setCreatedBy(uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());
            paymentRepository.save(payment);
        }

        BigDecimal currentDebt = (shop.getCurrentDebt() != null) ? shop.getCurrentDebt() : BigDecimal.ZERO;
        BigDecimal debtIncrease = totalAmount.subtract(paidAmount);
        shop.setCurrentDebt(currentDebt.add(debtIncrease));
        shopRepository.save(shop);

        log.info("Sotuv muvaffaqiyatli yaratildi: saleId={}, shopId={}, totalAmount={}, paymentType={}",
                savedSale.getId(), shop.getId(), totalAmount, savedSale.getPaymentType());

        return SaleMapper.toResponse(savedSale);
    }

    @Override
    @Transactional
    public SaleResponse cancelSale(Long id, String reason) {
        Sale sale = saleRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sotuv topilmadi, id: " + id));

        if (Boolean.TRUE.equals(sale.getIsCancelled())) {
            throw new IllegalStateException("Ushbu sotuv allaqachon bekor qilingan (ID: " + id + ")");
        }

        Shop shop = shopRepository.findByIdForUpdate(sale.getShop().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi: id=" + sale.getShop().getId()));

        String currentUser = uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername();
        String cancelReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Sotuv bekor qilindi";
        LocalDateTime now = LocalDateTime.now();

        log.info("Sotuvni bekor qilish (Storno) boshlandi: saleId={}, shopId={}, reason={}", id, shop.getId(), cancelReason);

        // 1. Do'kon qarzini kamaytirish (totalAmount - initialPaidAmount)
        BigDecimal initialPaid = (sale.getInitialPaidAmount() != null) ? sale.getInitialPaidAmount() : BigDecimal.ZERO;
        BigDecimal debtIncreaseFromSale = sale.getTotalAmount().subtract(initialPaid);
        BigDecimal currentDebt = (shop.getCurrentDebt() != null) ? shop.getCurrentDebt() : BigDecimal.ZERO;
        shop.setCurrentDebt(currentDebt.subtract(debtIncreaseFromSale));
        shopRepository.save(shop);

        // 3. Bog'langan boshlang'ich to'lovni ham bekor qilish (faqat aniq bog'langan to'lovlar)
        List<Payment> linkedPayments = paymentRepository.findBySaleId(sale.getId());
        for (Payment payment : linkedPayments) {
            if (!Boolean.TRUE.equals(payment.getIsCancelled())) {
                payment.setIsCancelled(true);
                payment.setCancelReason("Sotuv bekor qilinganligi sababli: " + cancelReason);
                payment.setCancelledAt(now);
                payment.setCancelledBy(currentUser);
                paymentRepository.save(payment);
                log.info("Bog'langan to'lov bekor qilindi: paymentId={}, amount={}", payment.getId(), payment.getAmount());
            }
        }

        if (linkedPayments.isEmpty() && initialPaid.compareTo(BigDecimal.ZERO) > 0) {
            log.warn("Sotuvda boshlang'ich to'lov ko'rsatilgan, lekin bog'langan to'lov yozuvi topilmadi (saleId={}). Begona to'lovlarni bekor qilmaslik uchun taxminiy bekor qilish bajarilmadi.", sale.getId());
        }

        // 4. Sotuvni bekor qilingan deb belgilash
        sale.setIsCancelled(true);
        sale.setCancelReason(cancelReason);
        sale.setCancelledAt(now);
        sale.setCancelledBy(currentUser);
        Sale savedSale = saleRepository.save(sale);

        log.info("Sotuv muvaffaqiyatli bekor qilindi (Storno): saleId={}, bekorQildi={}", id, currentUser);
        return SaleMapper.toResponse(savedSale);
    }

    @Override
    public java.util.List<SaleResponse> getAll() {
        return saleRepository.findAll().stream()
                .map(SaleMapper::toResponse)
                .toList();
    }

    @Override
    public List<SaleResponse> getByShop(Long shopId) {
        return saleRepository.findByShopId(shopId).stream()
                .map(SaleMapper::toResponse)
                .toList();
    }

    @Override
    public SaleResponse getById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sotuv topilmadi, id: " + id));
        return SaleMapper.toResponse(sale);
    }
}