package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String name;

    private String unit;


    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "units_per_package", precision = 15, scale = 3)
    private BigDecimal unitsPerPackage;


    @Positive(message = "Tannarx musbat son bo'lishi kerak")
    @Column(name = "purchase_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal purchasePrice;



    @Column(name = "sell_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal sellPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;


    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}