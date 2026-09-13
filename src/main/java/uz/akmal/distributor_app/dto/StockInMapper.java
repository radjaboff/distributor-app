package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Product;
import uz.akmal.distributor_app.entity.StockIn;

public class StockInMapper {

    public static StockIn toEntity(StockInRequest request, Product product) {
        StockIn stockIn = new StockIn();
        stockIn.setProduct(product);
        stockIn.setPackageCount(request.getPackageCount());
        stockIn.setTotalCost(request.getTotalCost());
        return stockIn;
    }

    public static StockInResponse toResponse(StockIn stockIn) {
        StockInResponse response = new StockInResponse();
        response.setId(stockIn.getId());
        response.setProductId(stockIn.getProduct().getId());
        response.setProductName(stockIn.getProduct().getName());
        response.setPackageCount(stockIn.getPackageCount());
        response.setTotalCost(stockIn.getTotalCost());
        response.setDate(stockIn.getDate());
        response.setCreatedAt(stockIn.getCreatedAt());
        return response;
    }
}