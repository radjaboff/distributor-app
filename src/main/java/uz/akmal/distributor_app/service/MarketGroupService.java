package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.MarketGroupRequest;
import uz.akmal.distributor_app.dto.MarketGroupResponse;
import java.util.List;

public interface MarketGroupService {
    MarketGroupResponse create(MarketGroupRequest request);
    List<MarketGroupResponse> getAll();
    MarketGroupResponse getById(Long id);
    void delete(Long id);
}