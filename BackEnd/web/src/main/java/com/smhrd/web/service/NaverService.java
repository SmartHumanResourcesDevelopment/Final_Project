package com.smhrd.web.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NaverService {

    private final String clientId = "5BTv6gBgZA61McgvsB6X";
    private final String clientSecret = "OmUvyB5reOhOwxgpqUiIEG6FrC9mQ3kLdMEXVjZFMJTe0Rm4MM1JT2h5jOfLVlffWZqdc+EPgH7TkqAs5Tmotw==";
    private final String redirectUri = "http://localhost:5173//naver/callback";

    private final ObjectMapper mapper = new ObjectMapper();

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

    public Map<String, Object> getUserInfo(String accessToken) {
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

            if (response == null) return null;

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("email", response.get("email").asText());
            userInfo.put("nickname", response.get("nickname").asText());
            userInfo.put("id", response.get("id").asText());
            userInfo.put("profileImage", response.has("profile_image") ? response.get("profile_image").asText() : "");

            return userInfo;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
