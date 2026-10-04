package uz.akmal.distributor_app.service;

import uz.akmal.distributor_app.dto.*;
import uz.akmal.distributor_app.entity.SupplyPurchase;
import uz.akmal.distributor_app.entity.SupplyPayment;

import java.util.List;

public interface SupplierService {
    List<SupplierResponse> getSuppliers(String category);
    SupplierResponse getSupplier(Long id);
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
    SupplierLedgerResponse getSupplierLedger(Long supplierId);
    SupplyPurchase addPurchase(Long supplierId, SupplyPurchaseRequest request);
    SupplyPayment addPayment(Long supplierId, SupplyPaymentRequest request);
    void cancelEntry(Long supplierId, String type, Long entryId, String reason);
}
