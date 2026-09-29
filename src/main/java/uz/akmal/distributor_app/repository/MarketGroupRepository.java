package uz.akmal.distributor_app.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.distributor_app.entity.MarketGroup;

import java.util.List;
import java.util.Optional;

public interface MarketGroupRepository extends JpaRepository<MarketGroup, Long> {
    @Query("SELECT mg FROM MarketGroup mg WHERE mg.isDeleted = false OR mg.isDeleted IS NULL")
    List<MarketGroup> findByIsDeletedFalse();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT mg FROM MarketGroup mg WHERE mg.id = :id AND (mg.isDeleted = false OR mg.isDeleted IS NULL)")
    Optional<MarketGroup> findByIdWithLock(@Param("id") Long id);
}
