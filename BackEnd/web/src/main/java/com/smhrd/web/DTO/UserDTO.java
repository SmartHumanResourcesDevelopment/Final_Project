package com.smhrd.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
    private String user_id;     // 로그인용 아이디
    private String username;   // 이름
    private String phone_number;  // 전화번호
    private String nickname;     // 닉네임
    private String role;       // 관리자 or 사용자
    private String userProfile;     //프사 경로
}
