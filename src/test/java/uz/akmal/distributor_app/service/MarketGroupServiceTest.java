package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.MarketGroupResponse;
import uz.akmal.distributor_app.entity.MarketGroup;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.impl.MarketGroupServiceImpl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MarketGroupServiceTest {

    @Mock
    private MarketGroupRepository marketGroupRepository;
    @Mock
    private ShopRepository shopRepository;

    private MarketGroupServiceImpl marketGroupService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        marketGroupService = new MarketGroupServiceImpl(marketGroupRepository, shopRepository);
    }

    @Test
    void testGetAll_MapsShopCountAndTotalDebtCorrectly() {
        MarketGroup mg1 = new MarketGroup();
        mg1.setId(1L);
        mg1.setName("Orzu Bozor");

        MarketGroup mg2 = new MarketGroup();
        mg2.setId(2L);
        mg2.setName("Eski Bozor");

        when(marketGroupRepository.findByIsDeletedFalse()).thenReturn(List.of(mg1, mg2));

        List<Object[]> queryResults = new ArrayList<>();
        queryResults.add(new Object[]{1L, 12L, new BigDecimal("4200000.00")});
        queryResults.add(new Object[]{2L, 5L, BigDecimal.ZERO});

        when(shopRepository.countActiveShopsAndDebtByMarketGroup()).thenReturn(queryResults);

        List<MarketGroupResponse> responses = marketGroupService.getAll();

        assertNotNull(responses);
        assertEquals(2, responses.size());

        MarketGroupResponse resp1 = responses.get(0);
        assertEquals(1L, resp1.getId());
        assertEquals("Orzu Bozor", resp1.getName());
        assertEquals(12, resp1.getShopCount());
        assertEquals(new BigDecimal("4200000.00"), resp1.getTotalDebt());

        MarketGroupResponse resp2 = responses.get(1);
        assertEquals(2L, resp2.getId());
        assertEquals("Eski Bozor", resp2.getName());
        assertEquals(5, resp2.getShopCount());
        assertEquals(BigDecimal.ZERO, resp2.getTotalDebt());
    }
}
