package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.MarketGroupMapper;
import uz.akmal.distributor_app.dto.MarketGroupRequest;
import uz.akmal.distributor_app.dto.MarketGroupResponse;
import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.service.MarketGroupService;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.repository.ShopRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MarketGroupServiceImpl implements MarketGroupService {

    private final MarketGroupRepository marketGroupRepository;
    private final ShopRepository shopRepository;

    public MarketGroupServiceImpl(MarketGroupRepository marketGroupRepository, ShopRepository shopRepository) {
        this.marketGroupRepository = marketGroupRepository;
        this.shopRepository = shopRepository;
    }

    @Override
    @Transactional
    public MarketGroupResponse create(MarketGroupRequest request) {
        MarketGroup marketGroup = MarketGroupMapper.toEntity(request);
        return MarketGroupMapper.toResponse(marketGroupRepository.save(marketGroup));
    }

    @Override
    public List<MarketGroupResponse> getAll() {
        return marketGroupRepository.findByIsDeletedFalse().stream()
                .map(MarketGroupMapper::toResponse)
                .toList();
    }

    @Override
    public MarketGroupResponse getById(Long id) {
        return MarketGroupMapper.toResponse(findEntityById(id));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MarketGroup existing = marketGroupRepository.findByIdWithLock(id)
                .filter(mg -> !Boolean.TRUE.equals(mg.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi yoki o'chirilgan, id: " + id));

        // Shu toifadagi barcha faol do'konlarni tekshiramiz
        List<Shop> activeShops = shopRepository.findByMarketGroupIdAndIsDeletedFalse(id);
        if (!activeShops.isEmpty()) {
            throw new IllegalStateException("Ushbu bozor toifasida hali " + activeShops.size() + " ta faol do'kon mavjud! Toifani o'chirishdan oldin uning ichidagi do'konlarni boshqa toifaga o'tkazing yoki o'chiring.");
        }

        existing.setIsDeleted(true);
        marketGroupRepository.save(existing);
    }

    private MarketGroup findEntityById(Long id) {
        return marketGroupRepository.findById(id)
                .filter(mg -> !Boolean.TRUE.equals(mg.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi yoki o'chirilgan, id: " + id));
    }

    @Override
    @Transactional
    public MarketGroupResponse update(Long id, MarketGroupRequest request) {
        MarketGroup existing = findEntityById(id);
        existing.setName(request.getName());
        return MarketGroupMapper.toResponse(marketGroupRepository.save(existing));
    }
}