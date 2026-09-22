package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shop extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String name;

    @Column(name = "owner_name")
    private String ownerName;

    private String phone;

    @Column(name = "current_debt", precision = 15, scale = 2)
    private BigDecimal currentDebt = BigDecimal.ZERO;


    @ManyToOne
    @JoinColumn(name = "market_group_id", nullable = false)
    private MarketGroup marketGroup;


    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}