package com.practice.foodordering.service;

import com.practice.foodordering.model.Restaurant;
import com.practice.foodordering.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @org.springframework.cache.annotation.Cacheable(value = "restaurants", key = "#cityId")
    public List<Restaurant> getRestaurantsByCity(UUID cityId) {
        return restaurantRepository.findByCityId(cityId);
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(UUID id, Restaurant updatedRestaurant) {
        return restaurantRepository.findById(id).map(restaurant -> {
            restaurant.setName(updatedRestaurant.getName());
            restaurant.setAddress(updatedRestaurant.getAddress());
            restaurant.setLandmark(updatedRestaurant.getLandmark());
            restaurant.setRating(updatedRestaurant.getRating());
            return restaurantRepository.save(restaurant);
        }).orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public void deleteRestaurant(UUID id) {
        restaurantRepository.deleteById(id);
    }
}
