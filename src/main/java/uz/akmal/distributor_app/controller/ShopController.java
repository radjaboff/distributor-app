package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.ShopRequest;
import uz.akmal.distributor_app.dto.ShopResponse;
import uz.akmal.distributor_app.service.ShopService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @PostMapping
    public ShopResponse create(@Valid @RequestBody ShopRequest request) {
        return shopService.create(request);
    }

    @GetMapping
    public List<ShopResponse> getAll(@RequestParam(required = false) Long groupId) {
        if (groupId != null) {
            return shopService.getByMarketGroup(groupId);
        }
        return shopService.getAll();
    }

    @GetMapping("/{id}")
    public ShopResponse getById(@PathVariable Long id) {
        return shopService.getById(id);
    }

    @PutMapping("/{id}")
    public ShopResponse update(@PathVariable Long id, @Valid @RequestBody ShopRequest request) {
        return shopService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        shopService.delete(id);
    }
}