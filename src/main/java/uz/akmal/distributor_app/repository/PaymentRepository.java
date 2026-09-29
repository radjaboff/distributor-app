package uz.akmal.distributor_app.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.akmal.distributor_app.entity.Payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT p FROM Payment p WHERE p.date >= :start AND p.date < :end")
    List<Payment> findByDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.shop WHERE p.date >= :start AND p.date < :end ORDER BY p.date DESC")
    List<Payment> findByDateBetweenWithShop(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Payment> findByShopId(Long shopId);

    List<Payment> findBySaleId(Long saleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.id = :id")
    Optional<Payment> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT MAX(p.date) FROM Payment p WHERE p.shop.id = :shopId AND (p.isCancelled = false OR p.isCancelled IS NULL)")
    LocalDateTime findLastActivePaymentDateByShopId(@Param("shopId") Long shopId);
}