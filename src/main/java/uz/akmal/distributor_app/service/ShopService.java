package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.ShopRequest;
import uz.akmal.distributor_app.dto.ShopResponse;
import java.util.List;

public interface ShopService {
    ShopResponse create(ShopRequest request);
    List<ShopResponse> getAll();
    List<ShopResponse> getByMarketGroup(Long marketGroupId);
    ShopResponse getById(Long id);
    ShopResponse update(Long id, ShopRequest request);
    void delete(Long id);
}