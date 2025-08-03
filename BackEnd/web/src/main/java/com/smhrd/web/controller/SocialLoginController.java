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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.util.HashMap;
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

    @Autowired
    private UserMapper userMapper;

    private final JwtNaverUtil jwtNaverUtil;
    private final NaverService naverService;

    public SocialLoginController(JwtNaverUtil jwtNaverUtil , NaverService naverService) {
        this.jwtNaverUtil = jwtNaverUtil;
        this.naverService = naverService;
    }

    @PostMapping("/api/naver/register")
    @ResponseBody
    public Map<String, Object> registerNaverUser(@RequestBody NaverDTO user) {
        Map<String, Object> result = new HashMap<>();

        // 닉네임 미입력 시 기본 닉네임
        if (user.getNickname() == null || user.getNickname().isEmpty()) {
            user.setNickname(user.getUsername() + "_user");
        }

        // 기본 프로필과 권한 설정
        user.setUserProfile("/uploads/default/user.png");
        user.setRole("팀원");

        // DB insert
        int inserted = userMapper.insertNaverUser(user);

        if (inserted > 0) {
            // JWT 발급
            String token = jwtNaverUtil.generateToken(user);
            result.put("success", true);
            result.put("token", token);
        } else {
            result.put("success", false);
        }

        return result;
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
    public RedirectView naverCallback(
        @RequestParam String code,
        @RequestParam String state,
        HttpSession session,
        HttpServletResponse response) {

        RedirectView redirectView = new RedirectView();

        try {
            System.out.println("====== [1] Callback 진입 ======");

            // ✅ CSRF 방어용 state 검증
            String sessionState = (String) session.getAttribute("oauth_state");
            System.out.println("세션 상태 값: " + sessionState + " / 요청 상태 값: " + state);

            if (sessionState == null || !sessionState.equals(state)) {
                System.out.println("❌ State 불일치 → 인증 실패");
                redirectView.setUrl("/error"); // 에러 페이지
                return redirectView;
            }

            // ✅ 2-1. AccessToken 발급
            System.out.println("------ [2] 토큰 발급 요청 시작 ------");
            String accessToken = naverService.getAccessToken(code, state);
            System.out.println("발급받은 accessToken = " + accessToken);
            if (accessToken == null) {
                redirectView.setUrl("/error");
                return redirectView;
            }

            // ✅ 2-2. 네이버 유저 정보 조회
            System.out.println("------ [3] 네이버 유저 정보 조회 시작 ------");
            NaverDTO naverUser = naverService.getUserInfo(accessToken);
            System.out.println("네이버 유저 정보 = " + naverUser);

            if (naverUser == null || naverUser.getNaverId() == null) {
                redirectView.setUrl("/error");
                return redirectView;
            }

            // ✅ 2-3. DB 조회
            System.out.println("------ [4] DB 조회 시작 ------");
            NaverDTO existUser = userMapper.findByNaverId(naverUser.getNaverId());
            System.out.println("DB 조회 유저 = " + existUser);

            if (existUser == null) {
                // 신규 사용자 → 회원가입 페이지로 이동
                String joinUrl = "http://localhost:5173/join" 
                + "?naverId=" + URLEncoder.encode(naverUser.getNaverId(), "UTF-8")
                + "&name=" + URLEncoder.encode(naverUser.getUsername(), "UTF-8")
                + "&phone=" + URLEncoder.encode(naverUser.getPhone_number(), "UTF-8");

                redirectView.setUrl(joinUrl);
            } else {
                // 기존 회원 → JWT 발급 후 로그인 처리
                String token = jwtNaverUtil.generateToken(existUser);
                String successUrl = "http://localhost:5173/login/success?token=" + token;
                redirectView.setUrl(successUrl);
            }
            return redirectView;
            } catch (Exception e) {
            e.printStackTrace();
            try { response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "서버 오류"); } catch (Exception ignored) {}
            return null;
        }
    }   
}
