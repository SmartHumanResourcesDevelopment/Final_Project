package com.smhrd.web.controller;

import com.smhrd.web.DTO.NaverDTO;
import com.smhrd.web.config.JwtNaverUtil;
import com.smhrd.web.repository.UserMapper;
import com.smhrd.web.service.NaverService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/auth/naver")
@RequiredArgsConstructor
public class SocialLoginController {

    @Value("${naver.client.id}")
    private String clientId;
    @Value("${naver.client.secret}")
    private String clientSecret;
    @Value("${naver.redirect.uri}")
    private String redirectUri;

    private final UserMapper userMapper;
    private final JwtNaverUtil jwtNaverUtil;
    private final NaverService naverService;

    /**
     * 1️⃣ 네이버 로그인 시작 (Redirect)
     */
    @GetMapping("/login")
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

        log.info("네이버 로그인 URL: {}", naverLoginUrl);
        return new RedirectView(naverLoginUrl);
    }

    /**
     * 2️⃣ 네이버 로그인 콜백
     */
    @GetMapping("/callback")
    public RedirectView naverCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpSession session,
            HttpServletResponse response) {

        RedirectView redirectView = new RedirectView();

        try {
            log.info("====== [1] Callback 진입 ======");

            // ✅ 1. CSRF 방어용 state 검증
            String sessionState = (String) session.getAttribute("oauth_state");
            if (sessionState == null || !sessionState.equals(state)) {
                log.error("❌ State 불일치 → 인증 실패");
                redirectView.setUrl("/error");
                return redirectView;
            }

            // ✅ 2. AccessToken 발급
            String accessToken = naverService.getAccessToken(code, state);
            log.info("발급받은 accessToken = {}", accessToken);
            if (accessToken == null) {
                redirectView.setUrl("/error");
                return redirectView;
            }

            // ✅ 3. 네이버 유저 정보 조회
            NaverDTO naverUser = naverService.getUserInfo(accessToken);
            log.info("네이버 유저 정보 = {}", naverUser);

            if (naverUser == null || naverUser.getNaverlogincheck() == null) {
                redirectView.setUrl("/error");
                return redirectView;
            }

            // ✅ 4. DB 조회
            NaverDTO existUser = userMapper.findByNaverId(naverUser.getNaverlogincheck());

            if (existUser == null) {
                // 신규 회원 → 프론트 회원가입 페이지로 이동
                String joinUrl = "http://localhost:5173/join"
                        + "?naverlogincheck=" + URLEncoder.encode(naverUser.getNaverlogincheck(), StandardCharsets.UTF_8)
                        + "&name=" + URLEncoder.encode(naverUser.getUsername(), StandardCharsets.UTF_8)
                        + "&phone=" + URLEncoder.encode(naverUser.getPhone_number(), StandardCharsets.UTF_8);

                redirectView.setUrl(joinUrl);

            } else {
                // 기존 회원 → JWT 발급 후 로그인 성공 페이지로 이동
                String token = jwtNaverUtil.generateToken(existUser);
                String successUrl = "http://localhost:5173/login/success?token=" + token;
                redirectView.setUrl(successUrl);
            }

            return redirectView;

        } catch (Exception e) {
            log.error("네이버 로그인 처리 중 오류", e);
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "서버 오류 발생");
            } catch (Exception ignored) {}
            return null;
        }
    }

    /**
     * 3️⃣ 네이버 회원가입 (프론트에서 POST)
     */
    @PostMapping("/register")
    @ResponseBody
    public Map<String, Object> registerNaverUser(@RequestBody NaverDTO user) {
        System.out.println("=== [DEBUG] /auth/register 요청 도착 ===");
        Map<String, Object> result = new HashMap<>();

        // 닉네임 기본값 처리
        if (user.getNickname() == null || user.getNickname().isEmpty()) {
            user.setNickname(user.getUsername() + "_user");
        }

        // 네이버 로그인시 유저값
        if (user.getNaverlogincheck() == null) {
            user.setNaverlogincheck("네이버유저");
}
        user.setUserProfile("/uploads/default/user.png");
        user.setRole("팀원");

        int inserted = userMapper.insertNaverUser(user);
        System.out.println("네이버 유저 insert 결과: " + inserted);

        if (inserted > 0) {
            String token = jwtNaverUtil.generateToken(user);
            result.put("success", true);
            result.put("token", token);
        } else {
            result.put("success", false);
        }

        return result;
    }
}
