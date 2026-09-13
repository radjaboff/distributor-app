package uz.akmal.distributor_app.dto;

import uz.akmal.distributor_app.entity.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setUnit(request.getUnit());
        product.setPackageName(request.getPackageName());
        product.setUnitsPerPackage(request.getUnitsPerPackage());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellPrice(request.getSellPrice());
        product.setStockQuantity(0);   // <-- QO'SHILDI: yangi mahsulot doim 0 qoldiqdan boshlanadi
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