package com.practice.foodordering.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${spring.mail.from:harshbohra2208@gmail.com}")
    private String fromEmail;

    @Value("${twilio.account.sid:}")
    private String twilioSid;

    @Value("${twilio.auth.token:}")
    private String twilioToken;

    @Value("${twilio.verify.service.sid:}")
    private String twilioVerifyServiceSid;

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
        if (identifier.contains("@")) {
            String otp = String.format("%06d", secureRandom.nextInt(1000000));
            otpStore.put(identifier, new OtpData(otp, LocalDateTime.now().plusMinutes(otpExpirationMinutes)));
            sendEmailViaBrevo(identifier, otp);
        } else {
            sendSms(identifier);
        }
    }

    private void sendEmailViaBrevo(String email, String otp) {
        try {
            log.info("Attempting to send OTP email to {} via Brevo HTTP API", email);

            if (brevoApiKey == null || brevoApiKey.isEmpty()) {
                throw new IllegalStateException("Brevo API key is not configured");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String body = String.format("""
                    {
                      "sender": { "name": "FoodDash", "email": "%s" },
                      "to": [{ "email": "%s" }],
                      "subject": "Your FoodDash OTP",
                      "textContent": "Your OTP for FoodDash login is: %s. This code expires in %d minutes."
                    }
                    """, fromEmail, email, otp, otpExpirationMinutes);

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    request,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully sent email OTP to {} via Brevo API", email);
            } else {
                log.error("Brevo API returned non-2xx status: {} for {}", response.getStatusCode(), email);
            }
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send email OTP to {}. Reason: {}", email, e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            log.warn("DEVELOPMENT MODE FALLBACK: OTP for {} is {}", email,
                    otpStore.get(email) != null ? otpStore.get(email).code : "N/A");
        }
    }

    private void sendSms(String phone) {
        try {
            String formattedPhone = phone.startsWith("+") ? phone : "+" + phone;
            log.info("Attempting to send Twilio Verify SMS to {}", formattedPhone);

            if (twilioSid.isEmpty() || twilioToken.isEmpty() || twilioVerifyServiceSid.isEmpty()) {
                throw new IllegalStateException(
                        "Twilio Verify not fully configured (SID, Token, or Service SID missing)");
            }

            Twilio.init(twilioSid, twilioToken);
            Verification.creator(twilioVerifyServiceSid, formattedPhone, "sms").create();

            log.info("Successfully initiated Twilio Verify for {}", formattedPhone);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send SMS OTP to {}. Reason: {}", phone, e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
        }
    }

    public boolean verifyOtp(String identifier, String code) {
        if (identifier.contains("@")) {
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
        } else {
            return verifySmsOtp(identifier, code);
        }
        return false;
    }

    private boolean verifySmsOtp(String phone, String code) {
        try {
            String formattedPhone = phone.startsWith("+") ? phone : "+" + phone;
            log.info("Verifying Twilio OTP for {}", formattedPhone);

            Twilio.init(twilioSid, twilioToken);
            VerificationCheck check = VerificationCheck.creator(twilioVerifyServiceSid)
                    .setTo(formattedPhone)
                    .setCode(code)
                    .create();

            boolean approved = "approved".equals(check.getStatus());
            if (approved) {
                log.info("Twilio OTP verification successful for {}", formattedPhone);
            } else {
                log.warn("Twilio OTP verification failed for {}: {}", formattedPhone, check.getStatus());
            }
            return approved;
        } catch (Exception e) {
            log.error("Error during Twilio OTP verification for {}: {}", phone, e.getMessage());
            return false;
        }
    }
}
