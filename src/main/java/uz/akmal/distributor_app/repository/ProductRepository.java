package uz.akmal.distributor_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.distributor_app.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
