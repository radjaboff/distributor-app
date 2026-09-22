package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.MarketGroup;

import java.util.List;

public interface MarketGroupRepository extends JpaRepository<MarketGroup, Long> {
    List<MarketGroup> findByIsDeletedFalse();
}
