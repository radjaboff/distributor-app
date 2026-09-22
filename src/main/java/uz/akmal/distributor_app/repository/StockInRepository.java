package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.StockIn;

import java.time.LocalDateTime;
import java.util.List;

public interface StockInRepository extends JpaRepository<StockIn, Long> {
    List<StockIn> findByProductId(Long productId);
    List<StockIn> findByDateBetween(LocalDateTime start, LocalDateTime end);
}
