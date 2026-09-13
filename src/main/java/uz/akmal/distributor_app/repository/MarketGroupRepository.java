package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.MarketGroup;

public interface MarketGroupRepository extends JpaRepository<MarketGroup, Long> {
}
