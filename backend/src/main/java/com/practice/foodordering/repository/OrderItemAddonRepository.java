package com.practice.foodordering.repository;

import com.practice.foodordering.model.OrderItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemAddonRepository extends JpaRepository<OrderItemAddon, UUID> {
    List<OrderItemAddon> findByOrderItemId(UUID orderItemId);
}
