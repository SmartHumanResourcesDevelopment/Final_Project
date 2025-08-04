package com.smhrd.web.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Getter
@Setter
public class SignUpRequest {
    private String user_id;     // 로그인용 아이디
    private String username;   // 이름
    private String password;   // 비밀번호
    private String phone_number;  // 전화번호
    private String naverlogincheck; // 네이버 가입 유저 판별
    private String nickname;     // 닉네임
    private String naverId; // 네이버 발급 고유 아이디(네이버 식별자)
}
