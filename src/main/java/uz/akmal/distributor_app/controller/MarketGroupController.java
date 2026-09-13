package uz.akmal.distributor_app.controller;

import uz.akmal.distributor_app.dto.MarketGroupRequest;
import uz.akmal.distributor_app.dto.MarketGroupResponse;
import uz.akmal.distributor_app.service.MarketGroupService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/market-groups")
public class MarketGroupController {

    private final MarketGroupService marketGroupService;

    public MarketGroupController(MarketGroupService marketGroupService) {
        this.marketGroupService = marketGroupService;
    }

    @PostMapping
    public MarketGroupResponse create(@Valid @RequestBody MarketGroupRequest request) {
        return marketGroupService.create(request);
    }

    @GetMapping
    public List<MarketGroupResponse> getAll() {
        return marketGroupService.getAll();
    }

    @GetMapping("/{id}")
    public MarketGroupResponse getById(@PathVariable Long id) {
        return marketGroupService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        marketGroupService.delete(id);
    }
}