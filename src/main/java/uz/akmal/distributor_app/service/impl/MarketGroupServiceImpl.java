package uz.akmal.distributor_app.service.impl;

import uz.akmal.distributor_app.dto.MarketGroupMapper;
import uz.akmal.distributor_app.dto.MarketGroupRequest;
import uz.akmal.distributor_app.dto.MarketGroupResponse;
import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.exception.ResourceNotFoundException;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.service.MarketGroupService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MarketGroupServiceImpl implements MarketGroupService {

    private final MarketGroupRepository marketGroupRepository;

    public MarketGroupServiceImpl(MarketGroupRepository marketGroupRepository) {
        this.marketGroupRepository = marketGroupRepository;
    }

    @Override
    public MarketGroupResponse create(MarketGroupRequest request) {
        MarketGroup marketGroup = MarketGroupMapper.toEntity(request);
        return MarketGroupMapper.toResponse(marketGroupRepository.save(marketGroup));
    }

    @Override
    public List<MarketGroupResponse> getAll() {
        return marketGroupRepository.findAll().stream()
                .map(MarketGroupMapper::toResponse)
                .toList();
    }

    @Override
    public MarketGroupResponse getById(Long id) {
        return MarketGroupMapper.toResponse(findEntityById(id));
    }

    @Override
    public void delete(Long id) {
        marketGroupRepository.deleteById(id);
    }

    private MarketGroup findEntityById(Long id) {
        return marketGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi, id: " + id));
    }
}