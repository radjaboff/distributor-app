package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.ProductRequest;
import uz.akmal.distributor_app.dto.ProductResponse;
import java.util.List;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    List<ProductResponse> getAll();
    ProductResponse getById(Long id);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
}