package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setUnit(request.getUnit());
        product.setPackageName(request.getPackageName() != null ? request.getPackageName() : "");
        product.setUnitsPerPackage(request.getUnitsPerPackage() != null ? request.getUnitsPerPackage() : java.math.BigDecimal.ONE);
        product.setPurchasePrice(request.getPurchasePrice() != null ? request.getPurchasePrice() : java.math.BigDecimal.ZERO);
        product.setSellPrice(request.getSellPrice() != null ? request.getSellPrice() : java.math.BigDecimal.ZERO);
        product.setStockQuantity(0);
        return product;
    }

    public static ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setUnit(product.getUnit());
        response.setPackageName(product.getPackageName());
        response.setUnitsPerPackage(product.getUnitsPerPackage());
        response.setPurchasePrice(product.getPurchasePrice());
        response.setSellPrice(product.getSellPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}