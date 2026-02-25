package com.practice.foodordering.service;

import com.practice.foodordering.model.Addon;
import com.practice.foodordering.model.FoodItem;
import com.practice.foodordering.model.Variant;
import com.practice.foodordering.repository.AddonRepository;
import com.practice.foodordering.repository.FoodItemRepository;
import com.practice.foodordering.repository.VariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final FoodItemRepository foodItemRepository;
    private final VariantRepository variantRepository;
    private final AddonRepository addonRepository;
    private final SearchService searchService;

    public List<FoodItem> getItemsByRestaurant(UUID restaurantId) {
        return foodItemRepository.findByRestaurantId(restaurantId);
    }

    public FoodItem createItem(FoodItem item) {
        FoodItem savedItem = foodItemRepository.save(item);
        // Note: For a real app, ensure restaurant and city are fetched lazily or mapped
        // before indexing
        try {
            searchService.indexFoodItem(savedItem);
        } catch (Exception e) {
            // Log error, continue saving to DB even if ES fails
            System.err.println("Failed to index to Elasticsearch: " + e.getMessage());
        }
        return savedItem;
    }

    public Variant createVariant(Variant variant) {
        return variantRepository.save(variant);
    }

    public Addon createAddon(Addon addon) {
        return addonRepository.save(addon);
    }

    public List<Variant> getVariantsForItem(UUID itemId) {
        return variantRepository.findByFoodItemId(itemId);
    }

    public List<Addon> getAddonsForItem(UUID itemId) {
        return addonRepository.findByFoodItemId(itemId);
    }

    public FoodItem updateItem(UUID id, FoodItem updatedItem) {
        return foodItemRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setPrice(updatedItem.getPrice());
            item.setItemType(updatedItem.getItemType());
            FoodItem saved = foodItemRepository.save(item);
            try {
                searchService.indexFoodItem(saved);
            } catch (Exception e) {
                System.err.println("Failed to update index: " + e.getMessage());
            }
            return saved;
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void deleteItem(UUID id) {
        foodItemRepository.deleteById(id);
    }
}
