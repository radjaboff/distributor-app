package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import uz.akmal.distributor_app.entity.Shop;

import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    List<Shop> findByMarketGroupId(Long marketGroupId);

    List<Shop> findByIsDeletedFalse();
    List<Shop> findByMarketGroupIdAndIsDeletedFalse(Long marketGroupId);
}
