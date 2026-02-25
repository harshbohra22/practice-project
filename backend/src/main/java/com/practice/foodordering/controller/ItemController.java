package com.practice.foodordering.controller;

import com.practice.foodordering.model.Addon;
import com.practice.foodordering.model.FoodItem;
import com.practice.foodordering.model.Variant;
import com.practice.foodordering.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<FoodItem>> getItemsByRestaurant(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(itemService.getItemsByRestaurant(restaurantId));
    }

    @PostMapping
    public ResponseEntity<FoodItem> createItem(@RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(itemService.createItem(foodItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateItem(@PathVariable UUID id, @RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(itemService.updateItem(id, foodItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/variants")
    public ResponseEntity<Variant> createVariant(@PathVariable UUID itemId, @RequestBody Variant variant) {
        // Ensure the variant is linked to the item (you may need to fetch the item
        // first depending on strictness)
        return ResponseEntity.ok(itemService.createVariant(variant));
    }

    @PostMapping("/{itemId}/addons")
    public ResponseEntity<Addon> createAddon(@PathVariable UUID itemId, @RequestBody Addon addon) {
        return ResponseEntity.ok(itemService.createAddon(addon));
    }

    @GetMapping("/{itemId}/variants")
    public ResponseEntity<List<Variant>> getVariantsForItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(itemService.getVariantsForItem(itemId));
    }

    @GetMapping("/{itemId}/addons")
    public ResponseEntity<List<Addon>> getAddonsForItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(itemService.getAddonsForItem(itemId));
    }
}
