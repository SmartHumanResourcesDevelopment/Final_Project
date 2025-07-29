package com.smhrd.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowCredentials(true);
        System.out.println("✔ CORS configured");
    }

     @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1) 실행 중인 디렉터리(예: .../BackEnd/web)
        Path cwd = Paths.get(System.getProperty("user.dir"));
        // 2) 부모의 부모로 올라가서 프로젝트 루트(예: .../Final_Project)
        Path projectRoot = cwd.getParent().getParent();
        // 3) 루트 아래 uploads 폴더를 가리키도록 resolve
        Path uploadPath = projectRoot.resolve(uploadDir).toAbsolutePath();

        // 파일 URL 형식으로 변환 (file:///...)
        String location = "file:///" + uploadPath.toString().replace("\\", "/") + "/";

        System.out.println("✔ Static uploads location: " + location);

        // /uploads/** 와 /zal/uploads/** 요청 모두 이 위치에서 서빙
        registry
          .addResourceHandler("/uploads/**")
          .addResourceLocations(location);
        registry
          .addResourceHandler("/zal/uploads/**")
          .addResourceLocations(location);
    }
}
