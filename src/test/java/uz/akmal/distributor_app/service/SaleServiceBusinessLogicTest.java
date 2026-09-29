package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.SaleItemRequest;
import uz.akmal.distributor_app.dto.SaleRequest;
import uz.akmal.distributor_app.dto.SaleResponse;
import uz.akmal.distributor_app.entity.Product;
import uz.akmal.distributor_app.entity.Sale;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.enums.PaymentMethod;
import uz.akmal.distributor_app.enums.PaymentType;
import uz.akmal.distributor_app.exception.InsufficientStockException;
import uz.akmal.distributor_app.exception.InvalidPaymentException;
import uz.akmal.distributor_app.repository.PaymentRepository;
import uz.akmal.distributor_app.repository.ProductRepository;
import uz.akmal.distributor_app.repository.SaleRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.impl.SaleServiceImpl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SaleServiceBusinessLogicTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ShopRepository shopRepository;
    @Mock
    private PaymentRepository paymentRepository;

    private SaleServiceImpl saleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        saleService = new SaleServiceImpl(saleRepository, productRepository, shopRepository, paymentRepository);
    }

    @Test
    void testCreateSale_Success_CalculatesTotalsAndStock() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setName("Test Shop");
        shop.setCurrentDebt(BigDecimal.valueOf(100_000));

        Product product = new Product();
        product.setId(5L);
        product.setName("Coca-Cola 1.5L");
        product.setPurchasePrice(BigDecimal.valueOf(8_000));
        product.setSellPrice(BigDecimal.valueOf(12_000));
        product.setStockQuantity(20);

        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));
        when(productRepository.findByIdWithLock(5L)).thenReturn(Optional.of(product));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> {
            Sale s = invocation.getArgument(0);
            s.setId(101L);
            return s;
        });

        SaleRequest request = new SaleRequest();
        request.setShopId(1L);
        SaleItemRequest itemReq = new SaleItemRequest();
        itemReq.setProductId(5L);
        itemReq.setPackageCount(5);
        request.setItems(List.of(itemReq));
        request.setInitialPaidAmount(BigDecimal.valueOf(20_000));
        request.setInitialPaymentMethod(PaymentMethod.NAQD);

        SaleResponse response = saleService.createSale(request);

        assertNotNull(response);
        // Jami summa: 5 * 12,000 = 60,000
        assertEquals(BigDecimal.valueOf(60_000), response.getTotalAmount());
        assertEquals(PaymentType.NASIYA, response.getPaymentType());

        // Ombordagi qoldiq: 20 - 5 = 15
        assertEquals(15, product.getStockQuantity());

        // Do'kon qarzi: 100,000 + (60,000 - 20,000) = 140,000
        assertEquals(BigDecimal.valueOf(140_000), shop.getCurrentDebt());

        verify(shopRepository).save(shop);
        verify(productRepository).save(product);
        verify(paymentRepository).save(any());
    }

    @Test
    void testCreateSale_InsufficientStock_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);

        Product product = new Product();
        product.setId(5L);
        product.setName("Fanta");
        product.setStockQuantity(3);

        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));
        when(productRepository.findByIdWithLock(5L)).thenReturn(Optional.of(product));

        SaleRequest request = new SaleRequest();
        request.setShopId(1L);
        SaleItemRequest itemReq = new SaleItemRequest();
        itemReq.setProductId(5L);
        itemReq.setPackageCount(10); // So'ralgan 10 ta, mavjud 3 ta
        request.setItems(List.of(itemReq));

        assertThrows(InsufficientStockException.class, () -> saleService.createSale(request));
    }

    @Test
    void testCreateSale_InitialPaidGreaterThanTotal_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);

        Product product = new Product();
        product.setId(5L);
        product.setSellPrice(BigDecimal.valueOf(10_000));
        product.setStockQuantity(10);

        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));
        when(productRepository.findByIdWithLock(5L)).thenReturn(Optional.of(product));

        SaleRequest request = new SaleRequest();
        request.setShopId(1L);
        SaleItemRequest itemReq = new SaleItemRequest();
        itemReq.setProductId(5L);
        itemReq.setPackageCount(2); // total 20,000
        request.setItems(List.of(itemReq));
        request.setInitialPaidAmount(BigDecimal.valueOf(25_000)); // 25,000 > 20,000

        assertThrows(InvalidPaymentException.class, () -> saleService.createSale(request));
    }

    @Test
    void testCancelSale_Success_RestoresStockAndDebtAndCancelsPayment() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.valueOf(140_000));

        Product product = new Product();
        product.setId(5L);
        product.setStockQuantity(15);

        Sale sale = new Sale();
        sale.setId(101L);
        sale.setShop(shop);
        sale.setTotalAmount(BigDecimal.valueOf(60_000));
        sale.setInitialPaidAmount(BigDecimal.valueOf(20_000));
        sale.setIsCancelled(false);

        uz.akmal.distributor_app.entity.SaleItem saleItem = new uz.akmal.distributor_app.entity.SaleItem();
        saleItem.setId(201L);
        saleItem.setSale(sale);
        saleItem.setProduct(product);
        saleItem.setPackageCount(5);
        sale.getItems().add(saleItem);

        uz.akmal.distributor_app.entity.Payment linkedPayment = new uz.akmal.distributor_app.entity.Payment();
        linkedPayment.setId(301L);
        linkedPayment.setSale(sale);
        linkedPayment.setShop(shop);
        linkedPayment.setAmount(BigDecimal.valueOf(20_000));
        linkedPayment.setIsCancelled(false);

        when(saleRepository.findByIdWithLock(101L)).thenReturn(Optional.of(sale));
        when(shopRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(shop));
        when(productRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(product));
        when(paymentRepository.findBySaleId(101L)).thenReturn(List.of(linkedPayment));
        when(saleRepository.save(any(Sale.class))).thenAnswer(i -> i.getArgument(0));

        SaleResponse response = saleService.cancelSale(101L, "Mijoz rad etdi");

        assertNotNull(response);
        assertTrue(response.getIsCancelled());
        assertEquals("Mijoz rad etdi", response.getCancelReason());

        // Ombordagi qoldiq tiklanishi kerak: 15 + 5 = 20
        assertEquals(20, product.getStockQuantity());
        verify(productRepository).save(product);

        // Do'kon qarzi kamayishi kerak: 140,000 - (60,000 - 20,000) = 100,000
        assertEquals(BigDecimal.valueOf(100_000), shop.getCurrentDebt());
        verify(shopRepository).save(shop);

        // Bog'langan to'lov ham bekor bo'lishi kerak
        assertTrue(linkedPayment.getIsCancelled());
        verify(paymentRepository).save(linkedPayment);
    }

    @Test
    void testCancelSale_SoftDeletedProductAndShop_Success() {
        Shop shop = new Shop();
        shop.setId(2L);
        shop.setIsDeleted(true);
        shop.setCurrentDebt(BigDecimal.valueOf(50_000));

        Product product = new Product();
        product.setId(6L);
        product.setIsDeleted(true);
        product.setStockQuantity(0);

        Sale sale = new Sale();
        sale.setId(102L);
        sale.setShop(shop);
        sale.setTotalAmount(BigDecimal.valueOf(30_000));
        sale.setInitialPaidAmount(BigDecimal.ZERO);
        sale.setIsCancelled(false);

        uz.akmal.distributor_app.entity.SaleItem saleItem = new uz.akmal.distributor_app.entity.SaleItem();
        saleItem.setId(202L);
        saleItem.setSale(sale);
        saleItem.setProduct(product);
        saleItem.setPackageCount(3);
        sale.getItems().add(saleItem);

        when(saleRepository.findByIdWithLock(102L)).thenReturn(Optional.of(sale));
        when(shopRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(shop));
        when(productRepository.findByIdForUpdate(6L)).thenReturn(Optional.of(product));
        when(paymentRepository.findBySaleId(102L)).thenReturn(List.of());
        when(saleRepository.save(any(Sale.class))).thenAnswer(i -> i.getArgument(0));

        SaleResponse response = saleService.cancelSale(102L, "O'chirilgan tovar/do'kon bekor qilindi");

        assertNotNull(response);
        assertTrue(response.getIsCancelled());
        assertEquals(3, product.getStockQuantity());
        assertEquals(BigDecimal.valueOf(20_000), shop.getCurrentDebt());
    }

    @Test
    void testCancelSale_AlreadyCancelled_ThrowsException() {
        Sale sale = new Sale();
        sale.setId(101L);
        sale.setIsCancelled(true);

        when(saleRepository.findByIdWithLock(101L)).thenReturn(Optional.of(sale));

        assertThrows(IllegalStateException.class, () -> saleService.cancelSale(101L, "Qayta bekor qilish"));
    }
}
