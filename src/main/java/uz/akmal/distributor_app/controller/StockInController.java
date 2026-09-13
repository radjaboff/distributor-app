package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.StockInRequest;
import uz.akmal.distributor_app.dto.StockInResponse;
import uz.akmal.distributor_app.service.StockInService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/stock-in")
public class StockInController {

    private final StockInService stockInService;

    public StockInController(StockInService stockInService) {
        this.stockInService = stockInService;
    }

    @PostMapping
    public StockInResponse create(@Valid @RequestBody StockInRequest request) {
        return stockInService.create(request);
    }

    @GetMapping
    public List<StockInResponse> getAll(@RequestParam(required = false) Long productId) {
        if (productId != null) {
            return stockInService.getByProduct(productId);
        }
        return stockInService.getAll();
    }
}