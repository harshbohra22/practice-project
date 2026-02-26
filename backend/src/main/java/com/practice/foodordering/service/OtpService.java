package com.practice.foodordering.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${twilio.account.sid:}")
    private String twilioSid;

    @Value("${twilio.auth.token:}")
    private String twilioToken;

    @Value("${twilio.from.phone:}")
    private String twilioFromPhone;

    @Value("${otp.expiration.minutes:5}")
    private int otpExpirationMinutes;

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    private static class OtpData {
        String code;
        LocalDateTime expiryTime;

        OtpData(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    @Async
    public void sendOtp(String identifier) {
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        otpStore.put(identifier, new OtpData(otp, LocalDateTime.now().plusMinutes(otpExpirationMinutes)));

        if (identifier.contains("@")) {
            sendEmail(identifier, otp);
        } else {
            sendSms(identifier, otp);
        }
    }

    private void sendEmail(String email, String otp) {
        try {
            log.info("Attempting to send OTP email to {}", email);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your FoodDash OTP");
            message.setText("Your OTP for FoodDash login is: " + otp + ". This code expires in " + otpExpirationMinutes
                    + " minutes.");
            mailSender.send(message);
            log.info("Successfully sent email OTP to {}", email);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send email OTP to {}. Reason: {}", email, e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            // In development, we log the OTP so the user can still proceed
            log.warn("DEVELOPMENT MODE FALLBACK: OTP for {} is {}", email, otp);
        }
    }

    private void sendSms(String phone, String otp) {
        try {
            log.info("Attempting to send SMS OTP to {}", phone);
            if (twilioSid.isEmpty() || twilioToken.isEmpty()) {
                throw new IllegalStateException("Twilio not configured (SID or Token missing)");
            }
            Twilio.init(twilioSid, twilioToken);
            Message.creator(
                    new PhoneNumber(phone),
                    new PhoneNumber(twilioFromPhone),
                    "Your FoodDash OTP is: " + otp)
                    .create();
            log.info("Successfully sent SMS OTP to {}", phone);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send SMS OTP to {}. Reason: {}", phone, e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            // In development, we log the OTP so the user can still proceed
            log.warn("DEVELOPMENT MODE FALLBACK: OTP for {} is {}", phone, otp);
        }
    }

    public boolean verifyOtp(String identifier, String code) {
        OtpData data = otpStore.get(identifier);
        if (data == null)
            return false;

        if (data.expiryTime.isBefore(LocalDateTime.now())) {
            otpStore.remove(identifier);
            return false;
        }

        if (data.code.equals(code)) {
            otpStore.remove(identifier);
            return true;
        }

        return false;
    }
}
