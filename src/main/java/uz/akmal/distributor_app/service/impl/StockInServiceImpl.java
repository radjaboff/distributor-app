package uz.akmal.distributor_app.service.impl;

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
import java.time.LocalDateTime;
import java.util.List;

@Service
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
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi"));

        int currentStock = (product.getStockQuantity() != null) ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentStock + request.getPackageCount());
        productRepository.save(product);

        StockIn stockIn = StockInMapper.toEntity(request, product);
        stockIn.setDate(LocalDateTime.now());

        return StockInMapper.toResponse(stockInRepository.save(stockIn));
    }

    @Override
    public List<StockInResponse> getAll() {
        return stockInRepository.findAll().stream()
                .map(StockInMapper::toResponse)
                .toList();
    }

    @Override
    public List<StockInResponse> getByProduct(Long productId) {
        return stockInRepository.findAll().stream()
                .filter(s -> s.getProduct().getId().equals(productId))
                .map(StockInMapper::toResponse)
                .toList();
    }
}