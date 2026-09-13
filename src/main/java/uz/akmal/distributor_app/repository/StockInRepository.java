package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.StockIn;

public interface StockInRepository extends JpaRepository<StockIn, Long> {
}
