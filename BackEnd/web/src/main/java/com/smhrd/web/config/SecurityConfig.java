package com.smhrd.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보안 비활성화 (개발 단계에서만)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 적용
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/zal/api/**").permitAll() // API 허용 경로
                .anyRequest().permitAll() // 나머지 요청도 허용 (개발 단계)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 프론트엔드 도메인 허용 (개발 환경)
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // 허용 메서드
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 허용 헤더
        config.setAllowedHeaders(Arrays.asList("*"));

        // 자격 증명 허용 (쿠키, 인증 정보)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}