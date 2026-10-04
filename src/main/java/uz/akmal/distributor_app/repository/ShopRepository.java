package uz.akmal.distributor_app.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uz.akmal.distributor_app.entity.Shop;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    List<Shop> findByMarketGroupId(Long marketGroupId);

    @Query("SELECT s FROM Shop s WHERE s.isDeleted = false OR s.isDeleted IS NULL")
    List<Shop> findByIsDeletedFalse();

    @Query("SELECT s FROM Shop s WHERE s.marketGroup.id = :marketGroupId AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<Shop> findByMarketGroupIdAndIsDeletedFalse(@Param("marketGroupId") Long marketGroupId);

    @Query("SELECT s.marketGroup.id, COUNT(s.id) FROM Shop s WHERE s.isDeleted = false OR s.isDeleted IS NULL GROUP BY s.marketGroup.id")
    List<Object[]> countActiveShopsByMarketGroup();

    @Query("SELECT COUNT(s) FROM Shop s WHERE s.marketGroup.id = :marketGroupId AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    long countByMarketGroupIdAndIsDeletedFalse(@Param("marketGroupId") Long marketGroupId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Shop s WHERE s.id = :id AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    Optional<Shop> findByIdWithLock(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Shop s WHERE s.id = :id")
    Optional<Shop> findByIdForUpdate(@Param("id") Long id);
}

