package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import com.smhrd.web.DTO.JwtResponse;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.repository.UserMapper;
import com.smhrd.web.service.JwtService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class SocialLoginController{

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.redirect.uri}")
    private String redirectUri;

    private final JwtService jwtService;

    @Autowired
    private UserMapper userMapper;

    public SocialLoginController(JwtService jwtService){
        this.jwtService = jwtService;
    }

    
    @GetMapping("/naver/login")
    public RedirectView startNaverLogin(HttpSession session) {
        // 1. state 생성 및 세션에 저장
        String state = UUID.randomUUID().toString();
        session.setAttribute("oauth_state", state);

        // 2. 네이버 로그인 URL 생성
        String naverLoginUrl = UriComponentsBuilder
        .fromUriString("https://nid.naver.com/oauth2.0/authorize")
        .queryParam("response_type", "code")
        .queryParam("client_id", clientId)
        .queryParam("redirect_uri", redirectUri)
        .queryParam("state", state)
        .build()
        .toUriString();

        // 3. 프론트가 이 URL을 직접 사용하게 처리

        System.out.println("생성된 state: " + state);
        System.out.println("리디렉션 URL: " + naverLoginUrl);

        return new RedirectView(naverLoginUrl);

    }

    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code, @RequestParam String state, HttpSession session, HttpServletResponse response) {
        try {
            
        // 1. 세션에서 저장된 state 값 꺼내기
        String sessionState = (String) session.getAttribute("oauth_state");
        System.out.println("세션 상태 값: " + sessionState);
        System.out.println("요청 상태 값: " + state);

        // 2. 받은 state와 비교 검증
        if (sessionState == null || !sessionState.equals(state)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "State 불일치");
            return;
        }

        // 엑세스 토큰 발급
        String accessToken = getNaverAccessToken(code, state);
        System.out.println("accessToken = " + accessToken);

        if (accessToken == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰 발급 실패");
            return;
        }

        // 사용자의 정보 가져오기
        UserDTO user = getNaverUserInfo(accessToken);
        System.out.println("user = " + user);

        // DB에 사용자의 존재 여부를 확인
        boolean exists = userMapper.existsByUserNaver(user.getUser_id()) > 0;

        if (!exists) {
            // 신규 사용자면 회원가입 (naverlogincheck 컬럼에 네이버 ID 저장)
            user.setUser_id(accessToken);
            System.out.println(user.getUser_id());  // 네이버 ID 저장
            user.setRole("팀원"); // 기본 역할 설정
            userMapper.insertNaverUser(user);
        }
            // JWT 발급
            String jwt = jwtService.createToken(user.getNaverlogincheck());
            
            // 프론트로 리다이렉션
            String redirectUrl = "http://localhost:5173/naver/success?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);

    } catch (Exception e) {
         e.printStackTrace();
        try {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "서버 오류");
        } catch (Exception ignored) {}
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
            params.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // 네이버 토큰 API를 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://nid.naver.com/oauth2.0/token",
                HttpMethod.POST,
                request,
                Map.class
            );

            System.out.println("응답 본문: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // 네이버 사용자 정보를 요청 메서드
    private UserDTO getNaverUserInfo(String accessToken) {
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
            Map<String, Object> userInfo = (Map<String, Object>) body.get("response");

            // Map → UserDTO 수동 매핑
            UserDTO user = new UserDTO();
            user.setUser_id((String) userInfo.get("id")); // 네이버 고유 ID
            user.setUsername((String) userInfo.get("name")); // 이름
            user.setPhone_number((String) userInfo.get("mobile")); // 전화번호
            user.setNickname("네이버유저"); // 닉네임
            user.setUserProfile((String) userInfo.get("profile_image")); // 프로필
            user.setRole("팀원"); // 기본 역할 설정

            return user;
        }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
