package com.practice.foodordering.repository.search;

import com.practice.foodordering.model.search.FoodItemDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemSearchRepository extends ElasticsearchRepository<FoodItemDocument, String> {
    List<FoodItemDocument> findByNameContainingOrRestaurantNameContainingOrCityNameContaining(
            String name, String restaurantName, String cityName);
}
