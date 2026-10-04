package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(
    name = "suppliers",
    indexes = {
        @Index(name = "idx_suppliers_category", columnList = "category"),
        @Index(name = "idx_suppliers_active", columnList = "active")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String phone;

    @Column(nullable = false)
    private String category = "SHAKAR"; // SHAKAR, YOG, etc.

    @Column(name = "current_debt", precision = 15, scale = 2, nullable = false)
    private BigDecimal currentDebt = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean active = true;
}
