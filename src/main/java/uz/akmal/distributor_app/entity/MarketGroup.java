package uz.akmal.distributor_app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "market_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarketGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Toifa nomi bo'sh bo'lishi mumkin emas")
    @Column(nullable = false)
    private String name;
}