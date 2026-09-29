package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.backup.BackupData;
import uz.akmal.distributor_app.repository.*;
import uz.akmal.distributor_app.service.impl.BackupServiceImpl;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BackupServiceValidationTest {

    @Mock
    private MarketGroupRepository marketGroupRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ShopRepository shopRepository;
    @Mock
    private StockInRepository stockInRepository;
    @Mock
    private SaleRepository saleRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private EntityManager entityManager;

    private BackupServiceImpl backupService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        backupService = new BackupServiceImpl(
                marketGroupRepository,
                productRepository,
                shopRepository,
                stockInRepository,
                saleRepository,
                paymentRepository,
                entityManager
        );
    }

    @Test
    void testRestoreBackup_NullData_ThrowsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(null));
        assertTrue(ex.getMessage().contains("bo'sh yoki noto'g'ri"));
    }

    @Test
    void testRestoreBackup_InvalidAppName_ThrowsException() {
        BackupData data = BackupData.builder()
                .appName("Boshqa Dastur")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("Bozor Distributor"));
    }

    @Test
    void testRestoreBackup_EmptyData_ThrowsException() {
        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of())
                .products(List.of())
                .shops(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("hech qanday ma'lumot topilmadi"));
    }

    @Test
    void testRestoreBackup_MismatchedMarketGroupId_ThrowsException() {
        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(
                        BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()
                ))
                .shops(List.of(
                        BackupData.ShopDto.builder().id(10L).name("Baxt Do'kon").marketGroupId(999L).build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("mavjud bo'lmagan bozor toifasiga"));
    }

    @Test
    void testRestoreBackup_PartialDataWhenDbNotEmpty_ThrowsException() {
        org.mockito.Mockito.when(shopRepository.count()).thenReturn(15L);
        org.mockito.Mockito.when(productRepository.count()).thenReturn(10L);

        // Faqat bitta bozor guruhi bor, lekin do'konlar yo'q
        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(
                        BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()
                ))
                .shops(List.of())
                .products(List.of(
                        BackupData.ProductDto.builder().id(1L).name("Yog").build()
                ))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("do'konlar ro'yxati topilmadi"));
    }

    @Test
    void testRestoreBackup_MissingProductsWhenDbHasProducts_ThrowsException() {
        org.mockito.Mockito.when(shopRepository.count()).thenReturn(0L);
        org.mockito.Mockito.when(productRepository.count()).thenReturn(10L);

        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(
                        BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()
                ))
                .shops(List.of(
                        BackupData.ShopDto.builder().id(1L).name("Do'kon 1").marketGroupId(1L).build()
                ))
                .products(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("mahsulotlar ro'yxati topilmadi"));
    }

    @Test
    void testRestoreBackup_MissingSalesWhenDbHasSales_ThrowsException() {
        org.mockito.Mockito.when(shopRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(productRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(saleRepository.count()).thenReturn(20L);

        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()))
                .shops(List.of(BackupData.ShopDto.builder().id(1L).name("Do'kon 1").marketGroupId(1L).build()))
                .products(List.of(BackupData.ProductDto.builder().id(1L).name("Yog").build()))
                .sales(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("sotuvlar tarixi topilmadi"));
    }

    @Test
    void testRestoreBackup_MissingPaymentsWhenDbHasPayments_ThrowsException() {
        org.mockito.Mockito.when(shopRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(productRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(saleRepository.count()).thenReturn(0L);
        org.mockito.Mockito.when(paymentRepository.count()).thenReturn(15L);

        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()))
                .shops(List.of(BackupData.ShopDto.builder().id(1L).name("Do'kon 1").marketGroupId(1L).build()))
                .products(List.of(BackupData.ProductDto.builder().id(1L).name("Yog").build()))
                .payments(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("to'lovlar tarixi topilmadi"));
    }

    @Test
    void testRestoreBackup_MissingStockInsWhenDbHasStockIns_ThrowsException() {
        org.mockito.Mockito.when(shopRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(productRepository.count()).thenReturn(1L);
        org.mockito.Mockito.when(saleRepository.count()).thenReturn(0L);
        org.mockito.Mockito.when(paymentRepository.count()).thenReturn(0L);
        org.mockito.Mockito.when(stockInRepository.count()).thenReturn(5L);

        BackupData data = BackupData.builder()
                .appName("Bozor Distributor")
                .marketGroups(List.of(BackupData.MarketGroupDto.builder().id(1L).name("Chorsu").build()))
                .shops(List.of(BackupData.ShopDto.builder().id(1L).name("Do'kon 1").marketGroupId(1L).build()))
                .products(List.of(BackupData.ProductDto.builder().id(1L).name("Yog").build()))
                .stockIns(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> backupService.restoreBackup(data));
        assertTrue(ex.getMessage().contains("ombor kirimlari tarixi topilmadi"));
    }
}
