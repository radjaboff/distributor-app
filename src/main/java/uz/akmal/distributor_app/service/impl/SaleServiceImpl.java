package uz.akmal.distributor_app.service.impl;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
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

        Sale sale = new Sale();
        sale.setShop(shop);
        sale.setDate(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi"));

            int currentStock = (product.getStockQuantity() != null) ? product.getStockQuantity() : 0;
            if (currentStock < itemRequest.getPackageCount()) {
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

        BigDecimal debtIncrease = totalAmount.subtract(paidAmount);
        shop.setCurrentDebt(shop.getCurrentDebt().add(debtIncrease));
        shopRepository.save(shop);

        return SaleMapper.toResponse(savedSale);
    }

    @Override
    public java.util.List<SaleResponse> getAll() {
        return saleRepository.findAll().stream()
                .map(SaleMapper::toResponse)
                .toList();
    }

    @Override
    public java.util.List<SaleResponse> getByShop(Long shopId) {
        return saleRepository.findAll().stream()
                .filter(s -> s.getShop().getId().equals(shopId))
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