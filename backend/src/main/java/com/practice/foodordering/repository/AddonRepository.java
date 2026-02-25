package com.practice.foodordering.repository;

import com.practice.foodordering.model.Addon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddonRepository extends JpaRepository<Addon, UUID> {
    List<Addon> findByFoodItemId(UUID foodItemId);
}
