package uz.akmal.distributor_app.repository;

import uz.akmal.distributor_app.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByDateBetween(LocalDateTime start, LocalDateTime end);
}