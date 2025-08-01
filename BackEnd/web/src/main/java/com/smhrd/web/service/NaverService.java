package com.smhrd.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.web.DTO.LoginResponse;
import com.smhrd.web.DTO.NaverDTO;
import com.smhrd.web.config.JwtNaverUtil;
import com.smhrd.web.repository.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class NaverService {

    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtNaverUtil jwtNaverUtil;

    /** 
     * 네이버 AccessToken으로 유저 정보 조회
     */
    public NaverDTO getUserInfo(String accessToken) {
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
            NaverDTO user = new NaverDTO();
            String usernaverId = response.path("id").asText(null);
            // 네이버 회원 정보 없을때
            if (usernaverId == null) {
                // 사용자에게 네이버 회원이 아님
                // 프론트로 메시지 보내기 
            }
            else{
                // 네이버 유저라는뜻 >> 네이버에서 준 식별자 아이디로 데이터베이스 조회
                if(userMapper.existsByUserNaver(response.path("id").asText(null)) > 0){
                    // 네이버 유저 정보 담기
                    // user.setNaverId(response.path("id").asText(null));
                    // user.setUsername(response.path("name").asText(null));
                    // user.setPhone_number(response.path("mobile").asText(null));
                    // user.setNickname(response.path("nickname").asText("네이버유저"));
                    user = userMapper.findByUserNaver(usernaverId);
                    
                    // 로그 log(user)


                    jwtNaverUtil.generateToken(user);
                }
                else{
                    // 식별자, 이름, 번호 리액트로 전송 회원가입정보 입력  이동
                }
            }

            // 로그인 / 회원가입용 최소 필드만 매핑
           

            return user;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /** DB 조회로 네이버 로그인 회원가입 여부 */
    // public boolean isUserExistsByUserNaver(String naverId) {
    //     return userMapper.existsByUserNaver(naverId) > 0;
    // }
    // /** 네이버 로그인 회원 정보 조회 */
    // public NaverDTO getUserByUserNaver(String naverId) {
    //     return userMapper.findByUserNaver(naverId);
    // }
    // /** 네이버 로그인 유저 회원가입 등록함 */
    // public int registerNaverUser(NaverDTO user) {
    //     System.out.println("신규 회원가입 시도: " + user);
    //     return userMapper.insertNaverUser(user);
    // }

    /** JWT 발급 포함 로그인 처리 */
    // public LoginResponse handleNaverLogin(String naverId) {
    //     NaverDTO user = getUserByUserNaver(naverId);
    //     if (user == null) {
    //         return new LoginResponse(false, "회원가입 필요", (String) null);
    //     }
    //     String token = jwtNaverUtil.generateToken(user);
    //     return new LoginResponse(true, "네이버 로그인 성공", token);
    // }
}
