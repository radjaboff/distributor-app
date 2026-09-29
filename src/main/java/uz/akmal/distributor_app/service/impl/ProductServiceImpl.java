package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.ProductMapper;
import uz.akmal.distributor_app.dto.ProductRequest;
import uz.akmal.distributor_app.dto.ProductResponse;
import uz.akmal.distributor_app.entity.Product;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.ProductRepository;
import uz.akmal.distributor_app.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = ProductMapper.toEntity(request);
        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findByIsDeletedFalse().stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse getById(Long id) {
        Product product = findEntityById(id);
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product existing = productRepository.findByIdWithLock(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan, id: " + id));
        existing.setName(request.getName());
        existing.setUnit(request.getUnit());
        existing.setPackageName(request.getPackageName());
        existing.setUnitsPerPackage(request.getUnitsPerPackage());
        existing.setPurchasePrice(request.getPurchasePrice());
        existing.setSellPrice(request.getSellPrice());
        return ProductMapper.toResponse(productRepository.save(existing));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product existing = productRepository.findByIdWithLock(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan, id: " + id));

        if (existing.getStockQuantity() != null && existing.getStockQuantity() > 0) {
            throw new IllegalStateException("Omborda ushbu mahsulotdan hali " + existing.getStockQuantity() + " ta qoldiq mavjud! Qoldig'i bor mahsulotni o'chirib bo'lmaydi.");
        }

        existing.setIsDeleted(true);
        productRepository.save(existing);
    }

    private Product findEntityById(Long id) {
        return productRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan, id: " + id));
    }
}