package uz.akmal.distributor_app.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uz.akmal.distributor_app.dto.SupplierRequest;
import uz.akmal.distributor_app.dto.SupplierResponse;
import uz.akmal.distributor_app.dto.SupplyPurchaseRequest;
import uz.akmal.distributor_app.entity.Supplier;
import uz.akmal.distributor_app.entity.SupplyPurchase;
import uz.akmal.distributor_app.exception.InvalidPaymentException;
import uz.akmal.distributor_app.repository.SupplierRepository;
import uz.akmal.distributor_app.repository.SupplyPaymentRepository;
import uz.akmal.distributor_app.repository.SupplyPurchaseRepository;
import uz.akmal.distributor_app.service.impl.SupplierServiceImpl;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SupplierServiceBusinessLogicTest {

    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private SupplyPurchaseRepository purchaseRepository;
    @Mock
    private SupplyPaymentRepository paymentRepository;

    private SupplierServiceImpl supplierService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        supplierService = new SupplierServiceImpl(supplierRepository, purchaseRepository, paymentRepository);
    }

    @Test
    void testUpdateSupplier_CategoryChangeBlocked_WhenDebtExists() {
        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Zavod A");
        supplier.setCategory("SHAKAR");
        supplier.setCurrentDebt(new BigDecimal("5000000"));
        supplier.setActive(true);

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(purchaseRepository.existsBySupplierId(1L)).thenReturn(false);
        when(paymentRepository.existsBySupplierId(1L)).thenReturn(false);

        SupplierRequest request = new SupplierRequest();
        request.setName("Zavod A");
        request.setCategory("YOG");

        InvalidPaymentException ex = assertThrows(InvalidPaymentException.class, () ->
                supplierService.updateSupplier(1L, request)
        );
        assertTrue(ex.getMessage().contains("kategoriyasini"));
    }

    @Test
    void testUpdateSupplier_CategoryChangeBlocked_WhenPurchasesExist() {
        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Zavod A");
        supplier.setCategory("SHAKAR");
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(purchaseRepository.existsBySupplierId(1L)).thenReturn(true);
        when(paymentRepository.existsBySupplierId(1L)).thenReturn(false);

        SupplierRequest request = new SupplierRequest();
        request.setName("Zavod A");
        request.setCategory("YOG");

        InvalidPaymentException ex = assertThrows(InvalidPaymentException.class, () ->
                supplierService.updateSupplier(1L, request)
        );
        assertTrue(ex.getMessage().contains("kategoriyasini"));
    }

    @Test
    void testUpdateSupplier_CategoryChangeAllowed_WhenClean() {
        Supplier supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("Yangi Ta'minotchi");
        supplier.setCategory("SHAKAR");
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);

        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(purchaseRepository.existsBySupplierId(1L)).thenReturn(false);
        when(paymentRepository.existsBySupplierId(1L)).thenReturn(false);
        when(supplierRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SupplierRequest request = new SupplierRequest();
        request.setName("Yangi Ta'minotchi");
        request.setCategory("YOG");

        SupplierResponse response = supplierService.updateSupplier(1L, request);
        assertEquals("YOG", response.getCategory());
    }

    @Test
    void testAddOilPurchase_ServerSideVerification() {
        Supplier supplier = new Supplier();
        supplier.setId(2L);
        supplier.setName("Yog' Zavod");
        supplier.setCategory("YOG");
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);

        when(supplierRepository.findByIdWithLock(2L)).thenReturn(Optional.of(supplier));
        when(purchaseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SupplyPurchaseRequest request = new SupplyPurchaseRequest();
        request.setProductName("Sunny Gold 5L");
        request.setCategory("YOG");
        request.setBoxesCount(100);
        request.setItemsPerBox(3);
        request.setLitersPerItem(new BigDecimal("5.0"));
        request.setPricePerLiter(new BigDecimal("1.80"));
        request.setPurchaseDate("2026-10-05T10:00:00");

        SupplyPurchase result = supplierService.addPurchase(2L, request);

        // 100 boxes * 3 items * 5.0L = 1500L
        assertEquals(new BigDecimal("1500.00"), result.getTotalLiters());
        // 1500L * $1.80 = $2700.00
        assertEquals(new BigDecimal("2700.00"), result.getTotalAmount());
        assertEquals(new BigDecimal("100"), result.getQuantity());
        assertEquals("KAROPKA", result.getUnit());
        assertEquals(new BigDecimal("2700.00"), supplier.getCurrentDebt());
    }

    @Test
    void testAddOilPurchase_RejectsNegativeOrZeroBoxCount() {
        Supplier supplier = new Supplier();
        supplier.setId(2L);
        supplier.setName("Yog' Zavod");
        supplier.setCategory("YOG");
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);

        when(supplierRepository.findByIdWithLock(2L)).thenReturn(Optional.of(supplier));

        SupplyPurchaseRequest request = new SupplyPurchaseRequest();
        request.setProductName("Sunny Gold");
        request.setBoxesCount(0);
        request.setItemsPerBox(3);
        request.setLitersPerItem(new BigDecimal("5.0"));
        request.setPricePerLiter(new BigDecimal("1.80"));

        assertThrows(InvalidPaymentException.class, () ->
                supplierService.addPurchase(2L, request)
        );
    }

    @Test
    void testAddPurchasesBatch_MultipleOilItems_MatchesUserInvoiceTotal() {
        Supplier supplier = new Supplier();
        supplier.setId(2L);
        supplier.setName("Yog' Zavod");
        supplier.setCategory("YOG");
        supplier.setCurrentDebt(BigDecimal.ZERO);
        supplier.setActive(true);

        when(supplierRepository.findByIdWithLock(2L)).thenReturn(Optional.of(supplier));
        when(purchaseRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. Южанка 5л: 10 kor, 3 dona, 5L, $1.63 -> 150L * 1.63 = 244.50
        SupplyPurchaseRequest item1 = new SupplyPurchaseRequest();
        item1.setProductName("Южанка 5л");
        item1.setBoxesCount(10);
        item1.setItemsPerBox(3);
        item1.setLitersPerItem(new BigDecimal("5.0"));
        item1.setPricePerLiter(new BigDecimal("1.63"));

        // 2. Ласка 1л: 10 kor, 15 dona, 1L, $1.62 -> 150L * 1.62 = 243.00
        SupplyPurchaseRequest item2 = new SupplyPurchaseRequest();
        item2.setProductName("Ласка масло 1 л");
        item2.setBoxesCount(10);
        item2.setItemsPerBox(15);
        item2.setLitersPerItem(new BigDecimal("1.0"));
        item2.setPricePerLiter(new BigDecimal("1.62"));

        // 3. Миладора 5л: 10 kor, 3 dona, 5L, $1.63 -> 150L * 1.63 = 244.50
        SupplyPurchaseRequest item3 = new SupplyPurchaseRequest();
        item3.setProductName("Миладора 5л");
        item3.setBoxesCount(10);
        item3.setItemsPerBox(3);
        item3.setLitersPerItem(new BigDecimal("5.0"));
        item3.setPricePerLiter(new BigDecimal("1.63"));

        java.util.List<SupplyPurchase> saved = supplierService.addPurchasesBatch(2L, java.util.List.of(item1, item2, item3));

        assertEquals(3, saved.size());
        assertEquals(new BigDecimal("244.50"), saved.get(0).getTotalAmount());
        assertEquals(new BigDecimal("243.00"), saved.get(1).getTotalAmount());
        assertEquals(new BigDecimal("244.50"), saved.get(2).getTotalAmount());
        // Jami qarz 732.00 bo'lishi shart:
        assertEquals(new BigDecimal("732.00"), supplier.getCurrentDebt());
        verify(purchaseRepository).saveAll(any());
        verify(supplierRepository).save(supplier);
    }
}
