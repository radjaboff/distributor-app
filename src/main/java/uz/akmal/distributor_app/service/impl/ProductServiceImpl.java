package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.ProductMapper;
import uz.akmal.distributor_app.dto.ProductRequest;
import uz.akmal.distributor_app.dto.ProductResponse;
import uz.akmal.distributor_app.entity.Product;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.ProductRepository;
import uz.akmal.distributor_app.service.ProductService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        Product product = ProductMapper.toEntity(request);
        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse getById(Long id) {
        Product product = findEntityById(id);
        return ProductMapper.toResponse(product);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product existing = findEntityById(id);
        existing.setName(request.getName());
        existing.setUnit(request.getUnit());
        existing.setPackageName(request.getPackageName());
        existing.setUnitsPerPackage(request.getUnitsPerPackage());
        existing.setPurchasePrice(request.getPurchasePrice());
        existing.setSellPrice(request.getSellPrice());
        return ProductMapper.toResponse(productRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    private Product findEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi, id: " + id));
    }
}