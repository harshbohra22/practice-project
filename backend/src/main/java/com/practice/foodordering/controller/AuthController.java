package com.practice.foodordering.controller;

import com.practice.foodordering.model.AppUser;
import com.practice.foodordering.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/customer/get_otp")
    public ResponseEntity<String> getOtp(@RequestParam String phoneOrEmail) {
        userService.generateOtp(phoneOrEmail);
        return ResponseEntity.ok("OTP sent successfully (Check console)");
    }

    @PostMapping("/customer/verify_otp")
    public ResponseEntity<AppUser> verifyOtp(@RequestParam String phoneOrEmail, @RequestParam String otp) {
        return userService.verifyOtpAndLogin(phoneOrEmail, otp)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AppUser> loginAdmin(@RequestParam String username, @RequestParam String passwordHash) {
        return userService.adminLogin(username, passwordHash)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }
}
