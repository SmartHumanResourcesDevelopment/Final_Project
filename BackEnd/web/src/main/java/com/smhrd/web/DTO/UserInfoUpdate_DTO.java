package com.smhrd.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Getter
@Setter
public class UserInfoUpdate_DTO {

    private String user_id;     // 로그인용 아이디
    private String password;     // 로그인용 아이디
    private String username;   // 이름
    private String phone_number;  // 전화번호
    private String nickname;     // 닉네임

    
}
