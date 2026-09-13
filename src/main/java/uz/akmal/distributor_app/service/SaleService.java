package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.SaleRequest;
import uz.akmal.distributor_app.dto.SaleResponse;
import java.util.List;

public interface SaleService {
    SaleResponse createSale(SaleRequest request);
    List<SaleResponse> getAll();
    List<SaleResponse> getByShop(Long shopId);
    SaleResponse getById(Long id);
}