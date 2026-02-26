package com.practice.foodordering.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Value("${app.cors.allowed-origin:http://localhost:5173}")
        private String allowedOrigin;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/cities/**",
                                                                "/api/restaurants/**", "/api/items/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/orders/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/orders/user/**")
                                                .permitAll()
                                                // Admin restricted routes
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/cities/**",
                                                                "/api/restaurants/**", "/api/items/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/cities/**",
                                                                "/api/restaurants/**", "/api/items/**",
                                                                "/api/orders/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/cities/**",
                                                                "/api/restaurants/**", "/api/items/**")
                                                .hasRole("ADMIN")
                                                .anyRequest().authenticated());
                return http.build();
        }

        @Bean
        public UrlBasedCorsConfigurationSource corsConfigurationSource() {
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true);
                // Using Patterns to be more flexible with Vercel dynamic URLs
                config.setAllowedOriginPatterns(List.of(
                                "http://localhost:[*]",
                                "https://*.vercel.app",
                                allowedOrigin,
                                allowedOrigin.replace("https://", "https://*.") // Handle origin pattern
                ));
                config.addAllowedHeader("*");
                config.addAllowedMethod("*");
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
