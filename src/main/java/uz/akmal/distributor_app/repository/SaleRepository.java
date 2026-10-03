package uz.akmal.distributor_app.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.akmal.distributor_app.entity.Sale;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT s FROM Sale s WHERE s.date >= :start AND s.date < :end")
    List<Sale> findByDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DISTINCT s FROM Sale s LEFT JOIN FETCH s.items i LEFT JOIN FETCH i.product LEFT JOIN FETCH s.shop WHERE s.date >= :start AND s.date < :end ORDER BY s.date DESC")
    List<Sale> findByDateBetweenWithDetails(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DISTINCT s FROM Sale s LEFT JOIN FETCH s.items i LEFT JOIN FETCH i.product WHERE s.shop.id = :shopId ORDER BY s.date ASC")
    List<Sale> findByShopId(@Param("shopId") Long shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Sale s WHERE s.id = :id")
    Optional<Sale> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT MAX(s.date) FROM Sale s WHERE s.shop.id = :shopId AND (s.isCancelled = false OR s.isCancelled IS NULL)")
    LocalDateTime findLastActiveSaleDateByShopId(@Param("shopId") Long shopId);

    @Query("SELECT MIN(s.date) FROM Sale s WHERE s.shop.id = :shopId AND (s.isCancelled = false OR s.isCancelled IS NULL)")
    LocalDateTime findFirstActiveSaleDateByShopId(@Param("shopId") Long shopId);
}