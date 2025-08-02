package com.smhrd.web.controller;

import com.smhrd.web.DTO.NaverDTO;
import com.smhrd.web.config.JwtNaverUtil;
import com.smhrd.web.repository.UserMapper;
import com.smhrd.web.service.NaverService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    @Autowired
    private UserMapper userMapper;

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

            // CSRF 방어용 state 검증
            String sessionState = (String) session.getAttribute("oauth_state");
            System.out.println("세션 상태 값: " + sessionState + " / 요청 상태 값: " + state);

            if (sessionState == null || !sessionState.equals(state)) {
                System.out.println("❌ State 불일치 → 인증 실패");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "State 불일치");
                return;
            }

            // 2-1. AccessToken 발급
            System.out.println("------ [2] 토큰 발급 요청 시작 ------");
            String accessToken = naverService.getAccessToken(code, state);
            System.out.println("발급받은 accessToken = " + accessToken);
            if (accessToken == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰 발급 실패");
                return;
            }

            // 2-2. 네이버 유저 정보 조회
            System.out.println("------ [3] 네이버 유저 정보 조회 시작 ------");
            NaverDTO naverUser = naverService.getUserInfo(accessToken);
            System.out.println("네이버 유저 정보 = " + naverUser);

            if (naverUser == null || naverUser.getNaverId() == null) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "사용자 정보 조회 실패");
                return;
            }

            // 2-3. DB 조회
            System.out.println("------ [4] DB 조회 시작 ------");
            boolean exists = userMapper.existsByUserNaver(naverUser.getNaverId()) > 0;
            NaverDTO dbUser;
            System.out.println("DB 조회 유저 = " + exists);

            if (exists) {
                // ✅ 기존 회원 → DB 정보로 JWT 생성
                System.out.println("------ [5] 기존 회원 → JWT 생성 ------");
                dbUser = userMapper.findByUserNaver(naverUser.getNaverId());

                String jwt = jwtNaverUtil.generateToken(dbUser); // DB 기반으로 생성
                System.out.println("생성된 JWT = " + jwt);

                String redirectUrl = "http://localhost:5173/naver/success?token="
                        + URLEncoder.encode(jwt, StandardCharsets.UTF_8);

                System.out.println("기존 회원 → JWT 발급 후 이동: " + redirectUrl);
                response.sendRedirect(redirectUrl);

            } else {
                // ✅ 신규 회원 → DB 저장 후 JWT 발급 & 회원가입 페이지로 이동
                System.out.println("------ [6] 신규 회원 → 회원가입 유도 ------");

                // 안전하게 null 방지
                String safeUsername = naverUser.getUsername() == null ? "" : naverUser.getUsername();
                String safePhone = naverUser.getPhone_number() == null ? "" : naverUser.getPhone_number();
                String safeNickname = naverUser.getNickname() == null ? "" : naverUser.getNickname();

                // DB에 저장할 유저 ID 생성
                naverUser.setUser_id("naver_" + System.currentTimeMillis());
                userMapper.insertNaverUser(naverUser);

                // DB 정보 다시 조회
                dbUser = userMapper.findByUserNaver(naverUser.getNaverId());

                // JWT 생성
                String token = jwtNaverUtil.generateToken(dbUser);
                System.out.println("JWT = " + token);

                // 프론트로 리다이렉트 (회원가입 페이지)
                String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/join")
                        .queryParam("naverId", naverUser.getNaverId())
                        .queryParam("username", URLEncoder.encode(safeUsername, StandardCharsets.UTF_8))
                        .queryParam("phone_number", URLEncoder.encode(safePhone, StandardCharsets.UTF_8))
                        .queryParam("nickname", URLEncoder.encode(safeNickname, StandardCharsets.UTF_8))
                        .queryParam("token", URLEncoder.encode(token, StandardCharsets.UTF_8)) // ✅ JWT 추가
                        .toUriString();

                System.out.println("신규 회원 → 회원가입 페이지 이동: " + redirectUrl);
                response.sendRedirect(redirectUrl);
            }

        } catch (Exception e) {
            e.printStackTrace();
            try { response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "서버 오류"); } catch (Exception ignored) {}
        }
    }
}
