package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.ShopMapper;
import uz.akmal.distributor_app.dto.ShopRequest;
import uz.akmal.distributor_app.dto.ShopResponse;
import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.ShopService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepository;
    private final MarketGroupRepository marketGroupRepository;

    public ShopServiceImpl(ShopRepository shopRepository, MarketGroupRepository marketGroupRepository) {
        this.shopRepository = shopRepository;
        this.marketGroupRepository = marketGroupRepository;
    }

    @Override
    public ShopResponse create(ShopRequest request) {
        MarketGroup marketGroup = findMarketGroup(request.getMarketGroupId());
        Shop shop = ShopMapper.toEntity(request, marketGroup);
        return ShopMapper.toResponse(shopRepository.save(shop));
    }

    @Override
    public List<ShopResponse> getAll() {
        return shopRepository.findAll().stream()
                .map(ShopMapper::toResponse)
                .toList();
    }

    @Override
    public List<ShopResponse> getByMarketGroup(Long marketGroupId) {
        return shopRepository.findAll().stream()
                .filter(shop -> shop.getMarketGroup().getId().equals(marketGroupId))
                .map(ShopMapper::toResponse)
                .toList();
    }

    @Override
    public ShopResponse getById(Long id) {
        return ShopMapper.toResponse(findEntityById(id));
    }

    @Override
    public ShopResponse update(Long id, ShopRequest request) {
        Shop existing = findEntityById(id);
        existing.setName(request.getName());
        existing.setOwnerName(request.getOwnerName());
        existing.setPhone(request.getPhone());
        existing.setMarketGroup(findMarketGroup(request.getMarketGroupId()));
        return ShopMapper.toResponse(shopRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        shopRepository.deleteById(id);
    }

    private Shop findEntityById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Do'kon topilmadi, id: " + id));
    }

    private MarketGroup findMarketGroup(Long id) {
        return marketGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi, id: " + id));
    }
}