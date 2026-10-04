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
    name = "supply_purchases",
    indexes = {
        @Index(name = "idx_supply_purchases_supplier_id", columnList = "supplier_id"),
        @Index(name = "idx_supply_purchases_date", columnList = "purchase_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyPurchase extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private String category = "SHAKAR";

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private String unit = "QOP"; // QOP or TONNA

    @Column(precision = 15, scale = 3, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate = LocalDateTime.now();

    @Column(length = 500)
    private String note;

    @Column(name = "liters_per_item", precision = 10, scale = 2)
    private BigDecimal litersPerItem;

    @Column(name = "items_per_box")
    private Integer itemsPerBox;

    @Column(name = "boxes_count")
    private Integer boxesCount;

    @Column(name = "price_per_liter", precision = 15, scale = 4)
    private BigDecimal pricePerLiter;

    @Column(name = "total_liters", precision = 15, scale = 3)
    private BigDecimal totalLiters;

    @Column(name = "is_cancelled", nullable = false)
    private Boolean isCancelled = false;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}
