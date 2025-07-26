package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.smhrd.web.DTO.JwtResponse;
import com.smhrd.web.service.JwtService;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/naver")
public class SocialLoginController{

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.redirect.uri}")
    private String redirectUri;

    private final JwtService jwtService;

    public SocialLoginController(JwtService jwtService){
        this.jwtService = jwtService;
    }

    
    @GetMapping("/callback")
    public ResponseEntity<?> naverCallback(@RequestParam String code, @RequestParam String state) {
    
    try {
        String accessToken = getNaverAccessToken(code, state);

        if (accessToken == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "토큰 발급 실패"));
        }

        Map<String, Object> userInfo = getNaverUserInfo(accessToken);

        if (userInfo != null) {
            // 사용자 식별자 추출 (ex. 이메일 or id)
            String userId = (String) userInfo.get("id"); // 또는 "email"

            // JWT 발급
            String jwtToken = jwtService.createToken(userId);

            return ResponseEntity.ok(
                    new JwtResponse(true, jwtToken, userInfo)
            );
        } else {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "사용자 정보 획득 실패"));
        }

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "서버 오류"));
    }
}


    // 네이버 액세스 토큰 요청 메서드
    private String getNaverAccessToken(String code, String state) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // 요청 파라미터 설정
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("code", code);
            params.add("state", state);
            params.add("redirect_uri", URLEncoder.encode(redirectUri, StandardCharsets.UTF_8.toString()));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // 네이버 토큰 API를 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://nid.naver.com/oauth2.0/token",
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // 네이버 사용자 정보를 요청 메서드
    private Map<String, Object> getNaverUserInfo(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 요청 헤더에 액세스 토큰 설정
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 네이버 사용자 정보 API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                entity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                return (Map<String, Object>) body.get("response");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
