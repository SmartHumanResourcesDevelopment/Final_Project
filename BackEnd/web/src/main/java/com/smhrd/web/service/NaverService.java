package com.smhrd.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.web.DTO.NaverDTO;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

@Service
public class NaverService {

    private final String PROFILE_API_URL = "https://openapi.naver.com/v1/nid/me";

    private final String CLIENT_ID = "5BTv6gBgZA61McgvsB6X";
    private final String CLIENT_SECRET = "44JbULEx5V";
    private final String REDIRECT_URI = "http://localhost:8095/zal/auth/naver/callback";

    /**
     * 네이버 AccessToken 발급
     */
    public String getAccessToken(String code, String state) {
        String accessToken = null;
        try {
            String apiURL = "https://nid.naver.com/oauth2.0/token";

            // POST 요청
            URL url = new URL(apiURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);

            // 요청 파라미터
            String postParams =
                    "grant_type=authorization_code" +
                    "&client_id=" + CLIENT_ID +
                    "&client_secret=" + CLIENT_SECRET +
                    "&redirect_uri=" + URLEncoder.encode(REDIRECT_URI, "UTF-8") +
                    "&code=" + code +
                    "&state=" + state;

            // 요청 전송
            try (OutputStream os = conn.getOutputStream()) {
                os.write(postParams.getBytes());
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            System.out.println("네이버 AccessToken 요청 상태코드: " + responseCode);

            // 응답 읽기
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }

            // JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(sb.toString());
            accessToken = jsonNode.get("access_token").asText();

            System.out.println("네이버 AccessToken 발급 완료: " + accessToken);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("네이버 AccessToken 발급 실패 ❌");
        }

        return accessToken;
    }

    /** 네이버 AccessToken으로 유저 정보 조회 */
    public NaverDTO getUserInfo(String accessToken) {
        NaverDTO naverUser = new NaverDTO();

        try {
            URL url = new URL(PROFILE_API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + accessToken);

            int responseCode = conn.getResponseCode();
            System.out.println("네이버 유저 정보 조회 HTTP 상태: " + responseCode);

            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }

            // JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(sb.toString());
            JsonNode responseNode = rootNode.get("response");

            if (responseNode != null) {
                // 네이버 API가 반환하는 필드
                String id = responseNode.get("id").asText(); // 네이버 고유ID
                String name = responseNode.has("name") ? responseNode.get("name").asText() : null;
                String nickname = responseNode.has("nickname") ? responseNode.get("nickname").asText() : null;
                String mobile = responseNode.has("mobile") ? responseNode.get("mobile").asText() : null;
                String profileImage = responseNode.has("profile_image") ? responseNode.get("profile_image").asText() : null;

                // DTO에 세팅
                naverUser.setNaverId(id);
                naverUser.setUsername(name);
                naverUser.setNickname(nickname);
                naverUser.setPhone_number(mobile);
                naverUser.setUserProfile(profileImage);

                System.out.println("네이버 유저 정보 조회 성공: " + naverUser);
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("네이버 유저 정보 조회 실패 ❌");
        }

        return naverUser;
    }
}
