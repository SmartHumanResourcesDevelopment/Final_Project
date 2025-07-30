package com.smhrd.web.controller;

import com.smhrd.web.service.NaverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/zal/auth/naver")
@RequiredArgsConstructor
public class AuthController {

    private final NaverService naverService;

    @GetMapping("/callback")
    public ResponseEntity<?> naverCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletResponse response) {

        String accessToken = naverService.getAccessToken(code, state);
        if (accessToken == null) {
            return ResponseEntity.status(400).body("Access Token 발급 실패");
        }

        Map<String, Object> userInfo = naverService.getUserInfo(accessToken);
        if (userInfo == null) {
            return ResponseEntity.status(400).body("사용자 정보 조회 실패");
        }

        return ResponseEntity.ok(Map.of("user", userInfo));
    }
}