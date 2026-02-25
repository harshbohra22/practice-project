package com.practice.foodordering.repository;

import com.practice.foodordering.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, UUID> {
    List<FoodItem> findByRestaurantId(UUID restaurantId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM FoodItem f WHERE " +
            "LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.restaurant.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.restaurant.city.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FoodItem> searchGlobal(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
