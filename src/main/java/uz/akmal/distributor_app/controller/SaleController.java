package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.SaleRequest;
import uz.akmal.distributor_app.dto.SaleResponse;
import uz.akmal.distributor_app.service.SaleService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public SaleResponse create(@Valid @RequestBody SaleRequest request) {
        return saleService.createSale(request);
    }

    @GetMapping
    public List<SaleResponse> getAll(@RequestParam(required = false) Long shopId) {
        if (shopId != null) {
            return saleService.getByShop(shopId);
        }
        return saleService.getAll();
    }

    @GetMapping("/{id}")
    public SaleResponse getById(@PathVariable Long id) {
        return saleService.getById(id);
    }
}