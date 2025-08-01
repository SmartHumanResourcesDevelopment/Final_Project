package com.smhrd.web.controller;

import com.smhrd.web.DTO.NaverDTO;
import com.smhrd.web.config.JwtNaverUtil;
import com.smhrd.web.service.JwtService;
import com.smhrd.web.service.NaverService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class SocialLoginController {

    @Value("${naver.client.id}")
    private String clientId;
    @Value("${naver.client.secret}")
    private String clientSecret;
    @Value("${naver.redirect.uri}")
    private String redirectUri;

    private final JwtNaverUtil jwtNaverUtil;
    private final NaverService naverService;

    public SocialLoginController(JwtNaverUtil jwtNaverUtil , NaverService naverService) {
        this.jwtNaverUtil = jwtNaverUtil;
        this.naverService = naverService;
    }

    /** 1. 네이버 로그인 시작 */
    @GetMapping("/naver/login")
    public RedirectView startNaverLogin(HttpSession session) {
        String state = UUID.randomUUID().toString();
        session.setAttribute("oauth_state", state);

        String naverLoginUrl = UriComponentsBuilder
                .fromUriString("https://nid.naver.com/oauth2.0/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("state", state)
                .toUriString();

        System.out.println("리디렉션 URL: " + naverLoginUrl);
        return new RedirectView(naverLoginUrl);
    }

    /** 2. 네이버 로그인 콜백 */
    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code,
                              @RequestParam String state,
                              HttpSession session,
                              HttpServletResponse response) {
        try {

            System.out.println("====== [1] Callback 진입 ======");

            String sessionState = (String) session.getAttribute("oauth_state");
            System.out.println("세션 상태 값: " + sessionState);
            System.out.println("요청 상태 값: " + state);

            if (sessionState == null || !sessionState.equals(state)) {
                System.out.println("❌ State 불일치 → 인증 실패");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "State 불일치");
                return;
            }

            // 2-1. AccessToken 발급
            System.out.println("------ [2] 토큰 발급 요청 시작 ------");
            String accessToken = getNaverAccessToken(code, state);
            System.out.println("발급받은 accessToken = " + accessToken);
            if (accessToken == null) {
                System.out.println("❌ 토큰 발급 실패");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰 발급 실패");
                return;
            }

            // 2-2. 네이버 유저 정보 조회
            System.out.println("------ [3] 네이버 유저 정보 조회 시작 ------");
            NaverDTO naverUser = naverService.getUserInfo(accessToken);
            System.out.println("네이버 유저: " + naverUser);

            if (naverUser == null || naverUser.getNaverId() == null) {
                System.out.println("❌ 사용자 정보 조회 실패");
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "사용자 정보 조회 실패");
                return;
            }

            // // 2-3. DB 가입 여부 확인
            // System.out.println("------ [4] DB 조회 시작 ------");
            // boolean exists = naverService.isUserExistsByUserNaver(naverUser.getNaverId());
            // System.out.println("DB 조회 유저 = " + exists);

            // if (exists) {
            //     // 기존 회원 → JWT 발급 후 리디렉션
            //     NaverDTO dbUser = naverService.getUserByUserNaver(naverUser.getNaverId());
            //     System.out.println("------ [5] 기존 회원 → JWT 생성 ------");
            //     String jwt = jwtNaverUtil.generateToken(dbUser);
            //     System.out.println("생성된 JWT = " + jwt);

            //     response.sendRedirect("http://localhost:5173/naver/success?token="
            //             + URLEncoder.encode(jwt, StandardCharsets.UTF_8));
            // } else {
            //     // 신규 회원 → 회원가입 페이지 이동
            //     System.out.println("------ [5] 신규 회원 → 회원가입 유도 ------");
            //     String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/join")
            //             .queryParam("naverId", naverUser.getNaverId())
            //             .queryParam("username", URLEncoder.encode(naverUser.getUsername(), StandardCharsets.UTF_8))
            //             .queryParam("phone_number", URLEncoder.encode(naverUser.getPhone_number(), StandardCharsets.UTF_8))
            //             .queryParam("nickname", URLEncoder.encode(naverUser.getNickname(), StandardCharsets.UTF_8))
            //             .toUriString();

            //     System.out.println("회원가입 리다이렉트 URL = " + redirectUrl);
            //     response.sendRedirect(redirectUrl);
            // }

        } catch (Exception e) {
            System.out.println("❌ 서버 예외 발생: " + e.getMessage());
            e.printStackTrace();
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "서버 오류");
            } catch (Exception ignored) {}
        }
    }

    /** 3. 네이버 AccessToken 요청 */
    private String getNaverAccessToken(String code, String state) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("code", code);
            params.add("state", state);
            params.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> res = restTemplate.exchange(
                    "https://nid.naver.com/oauth2.0/token",
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                return (String) res.getBody().get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
