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
@Table(name = "sale_items")
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

    @NotNull(message = "Mahsulot ko'rsatilishi shart")
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Paket soni ko'rsatilishi shart")
    @Positive(message = "Paket soni musbat son bo'lishi kerak")
    @Column(name = "package_count", nullable = false)
    private Integer packageCount;

    @Column(name = "price_at_sale", precision = 15, scale = 2, nullable = false)
    private BigDecimal priceAtSale;

    @Column(name = "cost_at_sale", precision = 15, scale = 2, nullable = false)
    private BigDecimal costAtSale;
}