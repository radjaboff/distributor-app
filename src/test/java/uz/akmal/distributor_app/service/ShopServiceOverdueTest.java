package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.OverdueShopResponse;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.repository.MarketGroupRepository;
import uz.akmal.distributor_app.repository.PaymentRepository;
import uz.akmal.distributor_app.repository.SaleRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.impl.ShopServiceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ShopServiceOverdueTest {

    @Mock
    private ShopRepository shopRepository;
    @Mock
    private MarketGroupRepository marketGroupRepository;
    @Mock
    private SaleRepository saleRepository;
    @Mock
    private PaymentRepository paymentRepository;

    private ShopServiceImpl shopService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        shopService = new ShopServiceImpl(shopRepository, marketGroupRepository, saleRepository, paymentRepository);
    }

    @Test
    void testGetOverdueShops_IgnoresCancelledPaymentsAndUsesActiveDate() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setName("Qarzdor do'kon");
        shop.setCurrentDebt(BigDecimal.valueOf(500_000));
        shop.setIsDeleted(false);

        when(shopRepository.findByIsDeletedFalse()).thenReturn(List.of(shop));

        // 30 kun oldin oxirgi faol to'lov bo'lgan (haqiqiy oxirgi to'lov)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        when(paymentRepository.findLastActivePaymentDateByShopId(1L)).thenReturn(thirtyDaysAgo);
        when(saleRepository.findLastActiveSaleDateByShopId(1L)).thenReturn(LocalDateTime.now().minusDays(40));

        List<OverdueShopResponse> overdueShops = shopService.getOverdueShops(14);

        assertNotNull(overdueShops);
        assertEquals(1, overdueShops.size());
        assertEquals("Qarzdor do'kon", overdueShops.get(0).getShopName());
        assertTrue(overdueShops.get(0).getDaysSinceLastPayment() >= 30);

        verify(paymentRepository).findLastActivePaymentDateByShopId(1L);
        verify(saleRepository).findLastActiveSaleDateByShopId(1L);
    }

    @Test
    void testGetOverdueShops_NotOverdue_WhenRecentActivePaymentExists() {
        Shop shop = new Shop();
        shop.setId(2L);
        shop.setName("Yangi to'lagan do'kon");
        shop.setCurrentDebt(BigDecimal.valueOf(200_000));
        shop.setIsDeleted(false);

        when(shopRepository.findByIsDeletedFalse()).thenReturn(List.of(shop));

        // 2 kun oldin faol to'lov qilgan
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        when(paymentRepository.findLastActivePaymentDateByShopId(2L)).thenReturn(twoDaysAgo);
        when(saleRepository.findLastActiveSaleDateByShopId(2L)).thenReturn(LocalDateTime.now().minusDays(10));

        List<OverdueShopResponse> overdueShops = shopService.getOverdueShops(14);

        assertNotNull(overdueShops);
        assertTrue(overdueShops.isEmpty(), "2 kun oldin to'lov qilgan do'kon 14 kunlik limitda muddati o'tgan bo'lmasligi kerak");
    }
}
