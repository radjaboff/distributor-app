package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.akmal.distributor_app.entity.SupplyPurchase;

import java.util.List;

@Repository
public interface SupplyPurchaseRepository extends JpaRepository<SupplyPurchase, Long> {
    List<SupplyPurchase> findBySupplierIdOrderByPurchaseDateAsc(Long supplierId);
    List<SupplyPurchase> findBySupplierIdAndIsCancelledFalse(Long supplierId);
}
