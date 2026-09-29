package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "stock_ins",
    indexes = {
        @Index(name = "idx_stock_ins_product_id", columnList = "product_id"),
        @Index(name = "idx_stock_ins_date", columnList = "date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
public class StockIn extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;


    @Column(name = "package_count", nullable = false)
    private Integer packageCount;// nechta butun paket olingani


    @Column(name = "total_cost", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(name = "product_name")
    private String productName;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();

    public String getEffectiveProductName() {
        if (productName != null && !productName.trim().isEmpty()) {
            return productName;
        }
        return product != null ? product.getName() : "";
    }
}