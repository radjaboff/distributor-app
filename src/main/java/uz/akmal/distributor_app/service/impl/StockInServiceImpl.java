package uz.akmal.distributor_app.service.impl;

import lombok.extern.slf4j.Slf4j;
import uz.akmal.distributor_app.dto.StockInMapper;
import uz.akmal.distributor_app.dto.StockInRequest;
import uz.akmal.distributor_app.dto.StockInResponse;
import uz.akmal.distributor_app.entity.Product;
import uz.akmal.distributor_app.entity.StockIn;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.ProductRepository;
import uz.akmal.distributor_app.repository.StockInRepository;
import uz.akmal.distributor_app.service.StockInService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class StockInServiceImpl implements StockInService {

    private final StockInRepository stockInRepository;
    private final ProductRepository productRepository;

    public StockInServiceImpl(StockInRepository stockInRepository, ProductRepository productRepository) {
        this.stockInRepository = stockInRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public StockInResponse create(StockInRequest request) {
        Product product = productRepository.findByIdWithLock(request.getProductId())
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan"));

        int currentStock = (product.getStockQuantity() != null) ? product.getStockQuantity() : 0;
        if (request.getPackageCount() == null || request.getPackageCount() <= 0) {
            throw new IllegalArgumentException("Paket soni musbat bo'lishi kerak!");
        }
        if (request.getPackageCount() > 1000000) {
            throw new IllegalArgumentException("Bir martalik paket soni 1 000 000 dan oshmasligi kerak!");
        }
        long newStock = (long) currentStock + request.getPackageCount();
        if (newStock > Integer.MAX_VALUE - 100000) {
            throw new IllegalArgumentException("Ombor qoldig'i ruxsat etilgan maksimal miqdordan oshib ketdi!");
        }
        // O'rtacha tortilgan tannarxni hisoblash (Weighted Average Cost)
        if (request.getTotalCost() != null && request.getPackageCount() > 0) {
            BigDecimal totalCost = request.getTotalCost();
            BigDecimal oldPrice = (product.getPurchasePrice() != null) ? product.getPurchasePrice() : BigDecimal.ZERO;
            if (currentStock <= 0 || oldPrice.compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal unitCost = totalCost.divide(BigDecimal.valueOf(request.getPackageCount()), 2, java.math.RoundingMode.HALF_UP);
                product.setPurchasePrice(unitCost);
            } else {
                BigDecimal oldTotalVal = oldPrice.multiply(BigDecimal.valueOf(currentStock));
                BigDecimal combinedVal = oldTotalVal.add(totalCost);
                BigDecimal combinedStock = BigDecimal.valueOf(newStock);
                BigDecimal weightedPrice = combinedVal.divide(combinedStock, 2, java.math.RoundingMode.HALF_UP);
                product.setPurchasePrice(weightedPrice);
            }
        }
        product.setStockQuantity((int) newStock);
        productRepository.save(product);

        StockIn stockIn = StockInMapper.toEntity(request, product);
        stockIn.setDate(LocalDateTime.now());
        stockIn.setCreatedBy(uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());

        StockIn saved = stockInRepository.save(stockIn);

        log.info("Bazadan kirim qilindi: productId={}, packageCount={}, yangiQoldiq={}",
                product.getId(), request.getPackageCount(), product.getStockQuantity());

        return StockInMapper.toResponse(saved);
    }

    @Override
    public List<StockInResponse> getAll() {
        return stockInRepository.findAll().stream()
                .map(StockInMapper::toResponse)
                .toList();
    }

    @Override
    public List<StockInResponse> getByProduct(Long productId) {
        return stockInRepository.findByProductId(productId).stream()
                .map(StockInMapper::toResponse)
                .toList();
    }
}