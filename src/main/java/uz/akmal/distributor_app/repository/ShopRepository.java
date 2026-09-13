package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import uz.akmal.distributor_app.entity.Shop;

public interface ShopRepository extends JpaRepository<Shop, Long> {
}
