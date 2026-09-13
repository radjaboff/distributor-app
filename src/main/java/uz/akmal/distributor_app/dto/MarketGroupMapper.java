package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.MarketGroup;

public class MarketGroupMapper {

    public static MarketGroup toEntity(MarketGroupRequest request) {
        MarketGroup marketGroup = new MarketGroup();
        marketGroup.setName(request.getName());
        return marketGroup;
    }

    public static MarketGroupResponse toResponse(MarketGroup marketGroup) {
        MarketGroupResponse response = new MarketGroupResponse();
        response.setId(marketGroup.getId());
        response.setName(marketGroup.getName());
        response.setCreatedAt(marketGroup.getCreatedAt());
        response.setUpdatedAt(marketGroup.getUpdatedAt());
        return response;
    }
}
