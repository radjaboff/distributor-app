package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.akmal.distributor_app.entity.SupplyPayment;

import java.util.List;

@Repository
public interface SupplyPaymentRepository extends JpaRepository<SupplyPayment, Long> {
    List<SupplyPayment> findBySupplierIdOrderByPaymentDateAsc(Long supplierId);
    List<SupplyPayment> findBySupplierIdAndIsCancelledFalse(Long supplierId);
    boolean existsBySupplierId(Long supplierId);
}
