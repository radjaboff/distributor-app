package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.OverdueShopResponse;
import uz.akmal.distributor_app.dto.ShopLedgerResponse;
import uz.akmal.distributor_app.dto.ShopRequest;
import uz.akmal.distributor_app.dto.ShopResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ShopService {
    ShopResponse create(ShopRequest request);
    List<ShopResponse> getAll();
    List<ShopResponse> getByMarketGroup(Long marketGroupId);
    ShopResponse getById(Long id);
    ShopResponse update(Long id, ShopRequest request);
    void delete(Long id);
    BigDecimal getDebt(Long shopId);
    ShopLedgerResponse getLedger(Long shopId);
    List<OverdueShopResponse> getOverdueShops(int thresholdDays);
}