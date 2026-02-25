package com.practice.foodordering.config;

import com.practice.foodordering.model.*;
import com.practice.foodordering.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

        private final UserRepository userRepository;
        private final CityRepository cityRepository;
        private final RestaurantRepository restaurantRepository;
        private final FoodItemRepository foodItemRepository;
        private final VariantRepository variantRepository;
        private final AddonRepository addonRepository;

        @Bean
        public CommandLineRunner seedData() {
                return args -> {
                        // 1. Seed Admin
                        if (userRepository.findByPhoneOrEmail("admin@fooddash.com").isEmpty()) {
                                userRepository.save(AppUser.builder()
                                                .phoneOrEmail("admin@fooddash.com")
                                                .role(Role.ADMIN)
                                                .passwordHash("admin123")
                                                .build());
                                System.out.println("Admin seeded.");
                        }

                        // 2. Seed Cities
                        City mumbai = cityRepository.findByName("Mumbai")
                                        .orElseGet(() -> cityRepository.save(City.builder().name("Mumbai").build()));
                        City bangalore = cityRepository.findByName("Bangalore")
                                        .orElseGet(() -> cityRepository.save(City.builder().name("Bangalore").build()));
                        City delhi = cityRepository.findByName("Delhi")
                                        .orElseGet(() -> cityRepository.save(City.builder().name("Delhi").build()));
                        City pune = cityRepository.findByName("Pune")
                                        .orElseGet(() -> cityRepository.save(City.builder().name("Pune").build()));
                        City chennai = cityRepository.findByName("Chennai")
                                        .orElseGet(() -> cityRepository.save(City.builder().name("Chennai").build()));

                        // 3. Seed Restaurants
                        seedRestaurant(mumbai, "Pizza Palace", "Andheri West", 4.5f, 30, 800);
                        seedRestaurant(mumbai, "Burger King", "Bandra", 4.2f, 25, 600);

                        seedRestaurant(bangalore, "South Indian Delight", "Indiranagar", 4.7f, 20, 400);
                        seedRestaurant(bangalore, "Taco Bell", "Koramangala", 4.0f, 35, 700);

                        seedRestaurant(delhi, "The Great Kabab Factory", "Connaught Place", 4.8f, 40, 1500);
                        seedRestaurant(delhi, "Moti Mahal Deluxe", "Daryaganj", 4.6f, 30, 1200);

                        seedRestaurant(pune, "German Bakery", "Koregaon Park", 4.4f, 20, 900);
                        seedRestaurant(pune, "Vohuman Cafe", "Sassoon Road", 4.3f, 15, 300);

                        seedRestaurant(chennai, "Murugan Idli Shop", "T. Nagar", 4.6f, 25, 400);
                        seedRestaurant(chennai, "Anjappar Chettinad Restaurant", "Adyar", 4.4f, 35, 800);

                        System.out.println("Enhanced data seeding completed successfully!");
                };
        }

        private void seedRestaurant(City city, String name, String address, float rating, int deliveryTime,
                        int costForTwo) {
                if (restaurantRepository.findByName(name).isEmpty()) {
                        Restaurant r = restaurantRepository.save(Restaurant.builder()
                                        .city(city)
                                        .name(name)
                                        .address(address)
                                        .rating(rating)
                                        .deliveryTime(deliveryTime)
                                        .costForTwo(costForTwo)
                                        .build());

                        // Seed a sample item for each
                        FoodItem pizza = foodItemRepository.save(FoodItem.builder()
                                        .restaurant(r)
                                        .name("Classic " + name + " Special")
                                        .price(new BigDecimal("299.00"))
                                        .itemType(ItemType.VARIANT_AND_ADDON)
                                        .build());

                        variantRepository
                                        .save(Variant.builder().foodItem(pizza).name("Regular")
                                                        .priceModifier(BigDecimal.ZERO).build());
                        variantRepository.save(
                                        Variant.builder().foodItem(pizza).name("Large")
                                                        .priceModifier(new BigDecimal("150.00")).build());

                        addonRepository
                                        .save(Addon.builder().foodItem(pizza).name("Extra Cheese")
                                                        .price(new BigDecimal("50.00")).build());
                }
        }
}
