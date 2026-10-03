package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(
    name = "sale_items",
    indexes = {
        @Index(name = "idx_sale_items_sale_id", columnList = "sale_id"),
        @Index(name = "idx_sale_items_product_id", columnList = "product_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleItem extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private Sale sale;


    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;


    @Column(name = "package_count", nullable = false)
    private Integer packageCount;

    @Column(name = "price_at_sale", precision = 15, scale = 2, nullable = false)
    private BigDecimal priceAtSale;

    @Column(name = "cost_at_sale", precision = 15, scale = 2)
    private BigDecimal costAtSale = BigDecimal.ZERO;

    @Column(name = "product_name")
    private String productName;

    public String getEffectiveProductName() {
        if (productName != null && !productName.trim().isEmpty()) {
            return productName;
        }
        return product != null ? product.getName() : "";
    }
}