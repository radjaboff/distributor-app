package uz.akmal.distributor_app.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import uz.akmal.distributor_app.dto.*;
import uz.akmal.distributor_app.entity.SupplyPurchase;
import uz.akmal.distributor_app.entity.SupplyPayment;
import uz.akmal.distributor_app.service.SupplierService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public List<SupplierResponse> getAll(@RequestParam(required = false) String category) {
        return supplierService.getSuppliers(category);
    }

    @GetMapping("/{id}")
    public SupplierResponse getById(@PathVariable Long id) {
        return supplierService.getSupplier(id);
    }

    @PostMapping
    public SupplierResponse create(@Valid @RequestBody SupplierRequest request) {
        return supplierService.createSupplier(request);
    }

    @PutMapping("/{id}")
    public SupplierResponse update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return supplierService.updateSupplier(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }

    @GetMapping("/{id}/ledger")
    public SupplierLedgerResponse getLedger(@PathVariable Long id) {
        return supplierService.getSupplierLedger(id);
    }

    @PostMapping("/{id}/purchases")
    public SupplyPurchase addPurchase(@PathVariable Long id, @Valid @RequestBody SupplyPurchaseRequest request) {
        return supplierService.addPurchase(id, request);
    }

    @PostMapping("/{id}/payments")
    public SupplyPayment addPayment(@PathVariable Long id, @Valid @RequestBody SupplyPaymentRequest request) {
        return supplierService.addPayment(id, request);
    }

    @PostMapping("/{id}/cancel-entry")
    public void cancelEntry(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String type = (String) body.get("type");
        Long entryId = Long.valueOf(body.get("entryId").toString());
        String reason = (String) body.get("reason");
        supplierService.cancelEntry(id, type, entryId, reason);
    }
}
