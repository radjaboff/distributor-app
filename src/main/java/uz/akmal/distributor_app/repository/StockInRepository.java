package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.distributor_app.entity.StockIn;

import java.time.LocalDateTime;
import java.util.List;

public interface StockInRepository extends JpaRepository<StockIn, Long> {
    List<StockIn> findByProductId(Long productId);
    @Query("SELECT si FROM StockIn si WHERE si.date >= :start AND si.date < :end")
    List<StockIn> findByDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT si FROM StockIn si LEFT JOIN FETCH si.product WHERE si.date >= :start AND si.date < :end ORDER BY si.date DESC")
    List<StockIn> findByDateBetweenWithProduct(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
