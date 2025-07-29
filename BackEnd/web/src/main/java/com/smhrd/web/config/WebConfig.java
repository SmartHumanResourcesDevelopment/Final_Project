package com.smhrd.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Paths; 


@Configuration
public class WebConfig implements WebMvcConfigurer {

    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   @Value("${app.upload-dir}")
    private String uploadDir;  // 이제 "../uploads"

      @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 상대경로든 절대경로든 처리하도록 분기
        String location;
        if (Paths.get(uploadDir).isAbsolute()) {
            location = "file://" + uploadDir.replace("\\", "/") + "/";
        } else {
            // 상대경로: user.dir 기준으로 resolve
            location = "file:///" +
                Paths.get(System.getProperty("user.dir"))
                     .resolve(uploadDir)
                     .toAbsolutePath()
                     .toString()
                     .replace("\\","/")
                + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}