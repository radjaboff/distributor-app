package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.SaleItem;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
}
