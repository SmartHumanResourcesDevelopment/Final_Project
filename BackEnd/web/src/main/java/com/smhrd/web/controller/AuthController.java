package com.smhrd.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.service.NaverService;
import com.smhrd.web.util.JwtUtil;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private NaverService naverService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/naver/callback")
    public ResponseEntity<?> naverCallback(@RequestParam String code, @RequestParam String state){
        String accessToken = naverService.getAccessToken(code, state);
        
        Map<String, Object> userInfo = naverService.getUserInfo(accessToken);
        
        if (userInfo != null) {
            Map<String, Object> claims = Map.of(
                "email", userInfo.get("email"),
                "nickname", userInfo.get("nickname")
            );

            String jwtToken = jwtUtil.generateToken(claims, 1000 * 60 * 60); // 1시간 유효

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", userInfo,
                "token", jwtToken
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "사용자 정보 조회 실패"
            ));
        }
    }

}
