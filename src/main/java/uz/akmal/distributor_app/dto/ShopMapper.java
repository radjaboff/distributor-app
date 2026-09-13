package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.entity.Shop;
import java.math.BigDecimal;

public class ShopMapper {

    public static Shop toEntity(ShopRequest request, MarketGroup marketGroup) {
        Shop shop = new Shop();
        shop.setName(request.getName());
        shop.setOwnerName(request.getOwnerName());
        shop.setPhone(request.getPhone());
        shop.setMarketGroup(marketGroup);
        shop.setCurrentDebt(BigDecimal.ZERO);
        return shop;
    }

    public static ShopResponse toResponse(Shop shop) {
        ShopResponse response = new ShopResponse();
        response.setId(shop.getId());
        response.setName(shop.getName());
        response.setOwnerName(shop.getOwnerName());
        response.setPhone(shop.getPhone());
        response.setCurrentDebt(shop.getCurrentDebt());
        response.setMarketGroupId(shop.getMarketGroup().getId());
        response.setMarketGroupName(shop.getMarketGroup().getName());
        response.setCreatedAt(shop.getCreatedAt());
        response.setUpdatedAt(shop.getUpdatedAt());
        return response;
    }
}