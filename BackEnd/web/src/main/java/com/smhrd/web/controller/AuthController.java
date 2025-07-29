package com.smhrd.web.controller;

import com.smhrd.web.service.NaverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/zal/auth/naver")
public class AuthController {

    @Autowired
    private NaverService naverService;

    @GetMapping("/callback")
    public Map<String, Object> naverCallback(@RequestParam String code, @RequestParam String state) {
        String accessToken = naverService.getAccessToken(code, state);

        if (accessToken == null) {
            throw new RuntimeException("Access Token 발급 실패");
        }

        Map<String, Object> userInfo = naverService.getUserInfo(accessToken);

        if (userInfo == null) {
            throw new RuntimeException("사용자 정보 조회 실패");
        }

        // 프론트에 사용자 정보 반환
        return Map.of("user", userInfo);
    }
}
