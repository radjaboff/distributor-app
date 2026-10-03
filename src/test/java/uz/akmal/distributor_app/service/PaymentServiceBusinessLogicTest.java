package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.PaymentRequest;
import uz.akmal.distributor_app.dto.PaymentResponse;
import uz.akmal.distributor_app.entity.Payment;
import uz.akmal.distributor_app.entity.Sale;
import uz.akmal.distributor_app.entity.Shop;
import uz.akmal.distributor_app.enums.PaymentMethod;
import uz.akmal.distributor_app.repository.PaymentRepository;
import uz.akmal.distributor_app.repository.SaleRepository;
import uz.akmal.distributor_app.repository.ShopRepository;
import uz.akmal.distributor_app.service.impl.PaymentServiceImpl;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceBusinessLogicTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private SaleRepository saleRepository;

    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        paymentService = new PaymentServiceImpl(paymentRepository, shopRepository, saleRepository);
    }

    @Test
    void testCreatePayment_ReducesShopDebt() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setName("Test Shop");
        shop.setCurrentDebt(BigDecimal.valueOf(100_000));

        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(50L);
            return p;
        });

        PaymentRequest request = new PaymentRequest();
        request.setShopId(1L);
        request.setAmount(BigDecimal.valueOf(30_000));
        request.setMethod(PaymentMethod.NAQD);

        PaymentResponse response = paymentService.create(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(30_000), response.getAmount());
        assertEquals(BigDecimal.valueOf(70_000), shop.getCurrentDebt());
        verify(shopRepository).save(shop);
    }

    @Test
    void testCancelPayment_Success_RestoresShopDebt() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.valueOf(70_000));

        Payment payment = new Payment();
        payment.setId(50L);
        payment.setShop(shop);
        payment.setAmount(BigDecimal.valueOf(30_000));
        payment.setMethod(PaymentMethod.NAQD);
        payment.setIsCancelled(false);

        when(paymentRepository.findByIdWithLock(50L)).thenReturn(Optional.of(payment));
        when(shopRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(shop));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = paymentService.cancelPayment(50L, "Xato to'lov");

        assertNotNull(response);
        assertTrue(response.getIsCancelled());
        assertEquals("Xato to'lov", response.getCancelReason());

        // Qarz qaytarilishi kerak: 70,000 + 30,000 = 100,000
        assertEquals(BigDecimal.valueOf(100_000), shop.getCurrentDebt());
        verify(shopRepository).save(shop);
    }

    @Test
    void testCancelPayment_SoftDeletedShop_Success() {
        Shop shop = new Shop();
        shop.setId(2L);
        shop.setIsDeleted(true);
        shop.setCurrentDebt(BigDecimal.valueOf(20_000));

        Payment payment = new Payment();
        payment.setId(51L);
        payment.setShop(shop);
        payment.setAmount(BigDecimal.valueOf(10_000));
        payment.setMethod(PaymentMethod.NAQD);
        payment.setIsCancelled(false);

        when(paymentRepository.findByIdWithLock(51L)).thenReturn(Optional.of(payment));
        when(shopRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(shop));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = paymentService.cancelPayment(51L, "O'chirilgan do'kon to'lovini bekor qilish");

        assertNotNull(response);
        assertTrue(response.getIsCancelled());
        assertEquals(BigDecimal.valueOf(30_000), shop.getCurrentDebt());
        verify(shopRepository).save(shop);
    }

    @Test
    void testCancelPayment_LinkedToSale_ThrowsException() {
        Sale sale = new Sale();
        sale.setId(10L);

        Payment payment = new Payment();
        payment.setId(50L);
        payment.setSale(sale);
        payment.setIsCancelled(false);

        when(paymentRepository.findByIdWithLock(50L)).thenReturn(Optional.of(payment));

        assertThrows(IllegalArgumentException.class, () -> paymentService.cancelPayment(50L, "Bekor qilish"));
    }

    @Test
    void testCancelPayment_AlreadyCancelled_ThrowsException() {
        Payment payment = new Payment();
        payment.setId(50L);
        payment.setIsCancelled(true);

        when(paymentRepository.findByIdWithLock(50L)).thenReturn(Optional.of(payment));

        assertThrows(IllegalStateException.class, () -> paymentService.cancelPayment(50L, "Qayta bekor"));
    }

    @Test
    void testCreatePayment_FutureDate_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.valueOf(100_000));
        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));

        PaymentRequest request = new PaymentRequest();
        request.setShopId(1L);
        request.setAmount(BigDecimal.valueOf(10_000));
        request.setMethod(PaymentMethod.NAQD);
        request.setPaymentDate(java.time.LocalDate.now().plusDays(2).toString());

        assertThrows(IllegalArgumentException.class, () -> paymentService.create(request));
    }

    @Test
    void testCreatePayment_BeforeFirstSaleDate_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.valueOf(100_000));
        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));
        when(saleRepository.findFirstActiveSaleDateByShopId(1L))
                .thenReturn(java.time.LocalDateTime.now().minusDays(1)); // First sale was yesterday

        PaymentRequest request = new PaymentRequest();
        request.setShopId(1L);
        request.setAmount(BigDecimal.valueOf(10_000));
        request.setMethod(PaymentMethod.NAQD);
        // Trying to record payment 5 days ago (before first sale)
        request.setPaymentDate(java.time.LocalDate.now().minusDays(5).toString());

        assertThrows(IllegalArgumentException.class, () -> paymentService.create(request));
    }

    @Test
    void testCreatePayment_ZeroOrNegativeDebt_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.ZERO);
        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));

        PaymentRequest request = new PaymentRequest();
        request.setShopId(1L);
        request.setAmount(BigDecimal.valueOf(10_000));
        request.setMethod(PaymentMethod.NAQD);

        assertThrows(uz.akmal.distributor_app.exception.InvalidPaymentException.class, () -> paymentService.create(request));
    }

    @Test
    void testCreatePayment_AmountExceedsDebt_ThrowsException() {
        Shop shop = new Shop();
        shop.setId(1L);
        shop.setCurrentDebt(BigDecimal.valueOf(50_000));
        when(shopRepository.findByIdWithLock(1L)).thenReturn(Optional.of(shop));

        PaymentRequest request = new PaymentRequest();
        request.setShopId(1L);
        request.setAmount(BigDecimal.valueOf(60_000)); // 60,000 > 50,000
        request.setMethod(PaymentMethod.NAQD);

        assertThrows(uz.akmal.distributor_app.exception.InvalidPaymentException.class, () -> paymentService.create(request));
    }
}
