package com.smhrd.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

     private final JwtFilter jwtFilter;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public SecurityConfig(@Lazy JwtUtil jwtUtil, @Lazy UserMapper userMapper, @Lazy JwtFilter jwtFilter) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.jwtFilter = jwtFilter;
    }


    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          return http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 적용
        .authorizeHttpRequests(auth -> auth
            // === Swagger 관련 경로 추가 ===
            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
            // === 로그인, 회원가입 API 경로 허용 ===
            .requestMatchers("/api/login", "/api/register").permitAll()
            // === API 경로 허용 ===
            .requestMatchers("/api/**").permitAll()
            // === 기존 public 경로 ===
            .requestMatchers("/zal/**").permitAll()
            // === 기타 경로 처리 ===
            .anyRequest().permitAll()
        )

        // httpBasic 비활성화
            .httpBasic(httpBasic -> httpBasic.disable())
            // JwtFilter를 UsernamePasswordAuthenticationFilter 이전에 추가
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 프론트엔드 도메인 허용 (개발 환경)
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true); // 인증정보 포함 가능

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        source.registerCorsConfiguration("/api/**", config); // API 경로 명시적 등록

        System.out.println("✔ SecurityConfig CORS configured");
        return source;
    }
}