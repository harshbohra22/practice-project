package com.practice.foodordering.service;

import com.practice.foodordering.model.City;
import com.practice.foodordering.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    @Cacheable(value = "cities")
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @CacheEvict(value = "cities", allEntries = true)
    public City createCity(City city) {
        return cityRepository.save(city);
    }

    @CacheEvict(value = "cities", allEntries = true)
    public City updateCity(UUID id, City updatedCity) {
        return cityRepository.findById(id).map(city -> {
            city.setName(updatedCity.getName());
            return cityRepository.save(city);
        }).orElseThrow(() -> new RuntimeException("City not found"));
    }

    @CacheEvict(value = "cities", allEntries = true)
    public void deleteCity(UUID id) {
        cityRepository.deleteById(id);
    }
}
