package com.smhrd.web.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.repository.UserMapper;

@Service
public class NaverService {

    private final String clientId = "5BTv6gBgZA61McgvsB6X";
    private final String clientSecret = "OmUvyB5reOhOwxgpqUiIEG6FrC9mQ3kLdMEXVjZFMJTe0Rm4MM1JT2h5jOfLVlffWZqdc+EPgH7TkqAs5Tmotw==";
    private final String redirectUri = "http://localhost:5173//naver/callback";

    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private UserMapper userMapper;

    public String getAccessToken(String code, String state) {
        try {
            String apiURL = "https://nid.naver.com/oauth2.0/token"
                    + "?grant_type=authorization_code"
                    + "&client_id=" + clientId
                    + "&client_secret=" + clientSecret
                    + "&redirect_uri=" + redirectUri
                    + "&code=" + code
                    + "&state=" + state;

            URL url = new URL(apiURL);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");

            BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();

            JsonNode jsonNode = mapper.readTree(sb.toString());
            return jsonNode.get("access_token").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public UserDTO getUserInfo(String accessToken)  {
        try {
            String apiURL = "https://openapi.naver.com/v1/nid/me";
            URL url = new URL(apiURL);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setRequestProperty("Authorization", "Bearer " + accessToken);

            BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();

            JsonNode jsonNode = mapper.readTree(sb.toString());
            JsonNode response = jsonNode.get("response");

            System.out.println("응답 JSON: " + jsonNode.toPrettyString());
            System.out.println("response 노드 존재 여부: " + jsonNode.has("response"));

            if (response == null){
                System.out.println("response 필드가 null입니다.");
            return null;
            }
            System.out.println("네이버 응답 전체: " + response.toPrettyString());

            UserDTO user = new UserDTO();
            user.setNaverlogincheck(response.has("id") ? response.get("id").asText() : null); // 네이버의 고유 식별자
            user.setUsername(response.has("name") ? response.get("name").asText() : null);
            user.setPhone_number(response.has("mobile") ? response.get("mobile").asText() : null);
            user.setNickname("네이버유저");
            user.setUserProfile(response.has("profile_image") ? response.get("profile_image").asText() : null);
            user.setRole("팀원"); // 기본값

            return user;

        } catch (Exception e) {
            System.out.println("예외 발생: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 3. 네이버 ID 기준으로 가입 여부 확인
    public boolean isUserExistsByUserNaver(String userId) {
        return userMapper.existsByUserNaver(userId) > 0;
    }

    // 4. 네이버 ID 기준으로 유저 정보 조회
    public UserDTO getUserByUserNaver(String NaverLoginCheck) {
        return userMapper.findByUserNaver(NaverLoginCheck);
    }

    // 5. 네이버 유저 등록
    public int registerNaverUser(UserDTO user) {
        return userMapper.insertNaverUser(user);
    }
}
