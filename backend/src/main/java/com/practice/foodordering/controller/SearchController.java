package com.practice.foodordering.controller;

import com.practice.foodordering.model.search.FoodItemDocument;
import com.practice.foodordering.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<List<FoodItemDocument>> search(@RequestParam String q) {
        return ResponseEntity.ok(searchService.searchGlobal(q));
    }
}
