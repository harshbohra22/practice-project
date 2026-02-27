package com.practice.foodordering.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<OrderItem> items;

    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant placedAt;
}
