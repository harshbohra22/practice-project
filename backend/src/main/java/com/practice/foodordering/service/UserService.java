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
    private final OtpService otpService;

    public void generateOtp(String phoneOrEmail) {
        otpService.sendOtp(phoneOrEmail);
    }

    public Optional<AppUser> verifyOtpAndLogin(String phoneOrEmail, String otp) {
        if (otpService.verifyOtp(phoneOrEmail, otp)) {
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
