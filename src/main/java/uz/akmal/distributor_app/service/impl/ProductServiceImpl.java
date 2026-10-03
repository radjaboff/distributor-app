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
        if (request.getUnit() != null) existing.setUnit(request.getUnit());
        if (request.getPackageName() != null) existing.setPackageName(request.getPackageName());
        if (request.getUnitsPerPackage() != null) existing.setUnitsPerPackage(request.getUnitsPerPackage());
        if (request.getPurchasePrice() != null) existing.setPurchasePrice(request.getPurchasePrice());
        if (request.getSellPrice() != null) existing.setSellPrice(request.getSellPrice());
        return ProductMapper.toResponse(productRepository.save(existing));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product existing = productRepository.findByIdWithLock(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan, id: " + id));

        existing.setIsDeleted(true);
        productRepository.save(existing);
    }

    private Product findEntityById(Long id) {
        return productRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi yoki o'chirilgan, id: " + id));
    }
}