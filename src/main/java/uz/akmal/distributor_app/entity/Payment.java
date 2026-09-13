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
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Do'kon ko'rsatilishi shart")
    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @NotNull(message = "Summa ko'rsatilishi shart")
    @Positive(message = "Summa musbat son bo'lishi kerak")
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotNull(message = "To'lov usuli ko'rsatilishi shart")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();
}