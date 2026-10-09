package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import uz.akmal.distributor_app.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "payments",
    indexes = {
        @Index(name = "idx_payments_shop_id", columnList = "shop_id"),
        @Index(name = "idx_payments_date", columnList = "date"),
        @Index(name = "idx_payments_sale_id", columnList = "sale_id"),
        @Index(name = "idx_payments_is_cancelled", columnList = "is_cancelled")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
public class Payment extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "is_cancelled", nullable = false, columnDefinition = "boolean default false")
    private Boolean isCancelled = false;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by", length = 100)
    private String cancelledBy;
}