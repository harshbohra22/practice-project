package com.practice.foodordering.service;

import com.practice.foodordering.model.Order;
import com.practice.foodordering.model.OrderStatus;
import com.practice.foodordering.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public List<Order> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId);
    }

    public Order placeOrder(Order order) {
        order.setStatus(OrderStatus.PLACED);
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                item.setOrder(order);
                if (item.getAddons() != null) {
                    item.getAddons().forEach(addon -> addon.setOrderItem(item));
                }
            });
        }
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(UUID orderId, OrderStatus status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            Order savedOrder = orderRepository.save(order);
            notificationService.sendOrderStatusUpdate(savedOrder);
            return savedOrder;
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order cancelOrder(UUID orderId) {
        return orderRepository.findById(orderId).map(order -> {
            if (order.getStatus() != OrderStatus.PLACED) {
                throw new RuntimeException("Cannot cancel order that is already " + order.getStatus());
            }

            long secondsSincePlaced = java.time.Duration.between(order.getPlacedAt(), Instant.now()).toSeconds();
            if (secondsSincePlaced > 60) {
                throw new RuntimeException("Cancellation window of 1 minute has expired.");
            }

            order.setStatus(OrderStatus.CANCELLED);
            Order savedOrder = orderRepository.save(order);
            notificationService.sendOrderStatusUpdate(savedOrder);
            return savedOrder;
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
