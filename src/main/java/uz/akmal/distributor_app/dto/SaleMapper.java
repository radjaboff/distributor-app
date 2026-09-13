package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Sale;
import uz.akmal.distributor_app.entity.SaleItem;

import java.util.List;

public class SaleMapper {

    public static SaleResponse toResponse(Sale sale) {
        SaleResponse response = new SaleResponse();
        response.setId(sale.getId());
        response.setShopId(sale.getShop().getId());
        response.setShopName(sale.getShop().getName());
        response.setDate(sale.getDate());
        response.setPaymentType(sale.getPaymentType());
        response.setTotalAmount(sale.getTotalAmount());

        List<SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(SaleMapper::toItemResponse)
                .toList();
        response.setItems(itemResponses);

        return response;
    }

    private static SaleItemResponse toItemResponse(SaleItem item) {
        SaleItemResponse response = new SaleItemResponse();
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setPackageCount(item.getPackageCount());
        response.setPriceAtSale(item.getPriceAtSale());
        response.setCostAtSale(item.getCostAtSale());
        return response;
    }
}