package com.practice.foodordering.service;

import com.practice.foodordering.model.AppUser;
import com.practice.foodordering.model.Role;
import com.practice.foodordering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final java.util.Map<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    public void generateOtp(String phoneOrEmail) {
        // String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6
        // digit OTP
        String otp = "123456"; // Fixed OTP for local testing convenience
        otpStore.put(phoneOrEmail, otp);
        System.out.println("OTP for " + phoneOrEmail + ": " + otp + " (Fixed for testing)");
    }

    public Optional<AppUser> verifyOtpAndLogin(String phoneOrEmail, String otp) {
        String storedOtp = otpStore.get(phoneOrEmail);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStore.remove(phoneOrEmail);
            return Optional.of(registerOrLoginCustomer(phoneOrEmail));
        }
        return Optional.empty();
    }

    private AppUser registerOrLoginCustomer(String phoneOrEmail) {
        Optional<AppUser> existingUser = userRepository.findByPhoneOrEmail(phoneOrEmail);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        AppUser newUser = AppUser.builder()
                .phoneOrEmail(phoneOrEmail)
                .role(Role.CUSTOMER)
                .build();
        return userRepository.save(newUser);
    }

    public Optional<AppUser> adminLogin(String username, String passwordHash) {
        return userRepository.findByPhoneOrEmail(username)
                .filter(user -> user.getRole() == Role.ADMIN && user.getPasswordHash().equals(passwordHash));
    }
}
