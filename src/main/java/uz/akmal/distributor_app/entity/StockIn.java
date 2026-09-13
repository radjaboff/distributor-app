package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockIn extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Mahsulot ko'rsatilishi shart")
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Paket soni ko'rsatilishi shart")
    @Positive(message = "Paket soni musbat son bo'lishi kerak")
    @Column(name = "package_count", nullable = false)
    private Integer packageCount;// nechta butun paket olingani

    @NotNull(message = "Umumiy narx ko'rsatilishi shart")
    @Positive(message = "Umumiy narx musbat son bo'lishi kerak")
    @Column(name = "total_cost", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();
}