package com.smhrd.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대한 
                .allowedOrigins("http://localhost:5173") //프론트 경로
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용한 메서드
                .allowedHeaders("*") //모든 헤더 허용
                .allowCredentials(true); // 쿠키 / 인증 정보 포함 허용
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    
}
