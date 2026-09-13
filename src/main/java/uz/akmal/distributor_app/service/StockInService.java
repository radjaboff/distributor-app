package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.StockInRequest;
import uz.akmal.distributor_app.dto.StockInResponse;
import java.util.List;

public interface StockInService {
    StockInResponse create(StockInRequest request);
    List<StockInResponse> getAll();
    List<StockInResponse> getByProduct(Long productId);
}