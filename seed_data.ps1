
# Data Seeder Script for Food Ordering App

$apiUrl = "http://localhost:8080/api"

write-host "--- Starting Data Seeding ---"

# 1. Add Cities
write-host "Adding Cities..."
$indoreResponse = Invoke-RestMethod -Uri "$apiUrl/cities" -Method Post -ContentType "application/json" -Body '{"name": "Indore"}'
$bhopalResponse = Invoke-RestMethod -Uri "$apiUrl/cities" -Method Post -ContentType "application/json" -Body '{"name": "Bhopal"}'

$indoreId = $indoreResponse.id
$bhopalId = $bhopalResponse.id

write-host "Added City: Indore ($indoreId)"
write-host "Added City: Bhopal ($bhopalId)"

# 2. Add Restaurants
write-host "`nAdding Restaurants..."
$gourmetPizzaResponse = Invoke-RestMethod -Uri "$apiUrl/restaurants" -Method Post -ContentType "application/json" -Body "{
    `"name`": `"Gourmet Pizza`",
    `"address`": `"123 Pizza St, Main Square`",
    `"rating`": 4.5,
    `"deliveryTime`": 25,
    `"costForTwo`": 800,
    `"city`": {`"id`": `"$indoreId`"}
}"

$lakeViewResponse = Invoke-RestMethod -Uri "$apiUrl/restaurants" -Method Post -ContentType "application/json" -Body "{
    `"name`": `"Lake View Cafe`",
    `"address`": `"45 Lake Rd, Upper Lake`",
    `"rating`": 4.2,
    `"deliveryTime`": 35,
    `"costForTwo`": 500,
    `"city`": {`"id`": `"$bhopalId`"}
}"

$gourmetId = $gourmetPizzaResponse.id
$lakeId = $lakeViewResponse.id

write-host "Added Restaurant: Gourmet Pizza ($gourmetId)"
write-host "Added Restaurant: Lake View Cafe ($lakeId)"

# 3. Add Food Items
write-host "`nAdding Food Items for Gourmet Pizza..."
@("Cheese Pizza", "Pepperoni Blast", "Custom Crust Pizza", "The Works") | ForEach-Object -Begin {$idx=0} {
    $types = @("NO_ADDON_NO_VARIANT", "ADDON_NO_VARIANT", "VARIANT_NO_ADDON", "VARIANT_AND_ADDON")
    $prices = @(12, 15, 14, 18)
    
    Invoke-RestMethod -Uri "$apiUrl/items" -Method Post -ContentType "application/json" -Body "{
        `"name`": `"$($_)`",
        `"price`": $($prices[$idx]),
        `"itemType`": `"$($types[$idx])`",
        `"restaurant`": {`"id`": `"$gourmetId`"}
    }"
    write-host "Added item: $_ ($($types[$idx]))"
    $idx++
}

write-host "`nAdding Food Items for Lake View Cafe..."
Invoke-RestMethod -Uri "$apiUrl/items" -Method Post -ContentType "application/json" -Body "{
    `"name`": `"Cold Coffee`",
    `"price`": 5,
    `"itemType`": `"NO_ADDON_NO_VARIANT`",
    `"restaurant`": {`"id`": `"$lakeId`"}
}"

Invoke-RestMethod -Uri "$apiUrl/items" -Method Post -ContentType "application/json" -Body "{
    `"name`": `"Club Sandwich`",
    `"price`": 8,
    `"itemType`": `"ADDON_NO_VARIANT`",
    `"restaurant`": {`"id`": `"$lakeId`"}
}"

write-host "`n--- Seeding Completed Successfully ---"
