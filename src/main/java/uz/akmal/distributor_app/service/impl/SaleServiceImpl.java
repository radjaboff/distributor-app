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

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi"));

        log.info("Yangi sotuv boshlandi: shopId={}", request.getShopId());

        Sale sale = new Sale();
        sale.setShop(shop);
        sale.setDate(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi"));

            int currentStock = (product.getStockQuantity() != null) ? product.getStockQuantity() : 0;
            if (currentStock < itemRequest.getPackageCount()) {
                log.warn("Omborda yetarli mahsulot yo'q: productId={}, so'ralgan={}, mavjud={}",
                        product.getId(), itemRequest.getPackageCount(), currentStock);
                throw new InsufficientStockException("Omborda yetarli mahsulot yo'q: " + product.getName());
            }

            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setSale(sale);
            item.setPackageCount(itemRequest.getPackageCount());
            item.setPriceAtSale(product.getSellPrice());
            item.setCostAtSale(product.getPurchasePrice());

            product.setStockQuantity(currentStock - itemRequest.getPackageCount());
            productRepository.save(product);

            sale.getItems().add(item);

            BigDecimal lineTotal = item.getPriceAtSale().multiply(BigDecimal.valueOf(item.getPackageCount()));
            totalAmount = totalAmount.add(lineTotal);
        }

        sale.setTotalAmount(totalAmount);


        BigDecimal paidAmount = (request.getInitialPaidAmount() == null) ? BigDecimal.ZERO : request.getInitialPaidAmount();

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
            payment.setAmount(paidAmount);
            payment.setMethod(request.getInitialPaymentMethod());
            payment.setDate(sale.getDate());
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