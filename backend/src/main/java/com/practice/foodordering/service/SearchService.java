package com.practice.foodordering.service;

import com.practice.foodordering.model.FoodItem;
import com.practice.foodordering.model.search.FoodItemDocument;
import com.practice.foodordering.repository.search.FoodItemSearchRepository;
import com.practice.foodordering.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final FoodItemSearchRepository searchRepository;
    private final FoodItemRepository foodItemRepository;

    @Autowired
    public SearchService(
            @Autowired(required = false) FoodItemSearchRepository searchRepository,
            FoodItemRepository foodItemRepository) {
        this.searchRepository = searchRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public void indexFoodItem(FoodItem item) {
        if (searchRepository == null)
            return;
        try {
            FoodItemDocument doc = FoodItemDocument.builder()
                    .id(item.getId().toString())
                    .name(item.getName())
                    .restaurantName(item.getRestaurant().getName())
                    .cityName(item.getRestaurant().getCity().getName())
                    .build();
            searchRepository.save(doc);
        } catch (Exception e) {
            System.err.println("Failed to index food item: " + e.getMessage());
        }
    }

    public List<FoodItemDocument> searchGlobal(String keyword) {
        if (searchRepository != null) {
            try {
                return searchRepository.findByNameContainingOrRestaurantNameContainingOrCityNameContaining(
                        keyword, keyword, keyword);
            } catch (Exception e) {
                System.err.println("Elasticsearch search failed, falling back to JPA: " + e.getMessage());
            }
        }

        // JPA Fallback
        return foodItemRepository.searchGlobal(keyword).stream()
                .map(item -> FoodItemDocument.builder()
                        .id(item.getId().toString())
                        .name(item.getName())
                        .restaurantName(item.getRestaurant().getName())
                        .cityName(item.getRestaurant().getCity().getName())
                        .build())
                .collect(Collectors.toList());
    }
}
