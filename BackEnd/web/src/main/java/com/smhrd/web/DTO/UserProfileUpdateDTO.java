package com.smhrd.web.DTO;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/** 이미지 변경 DTO */
public class UserProfileUpdateDTO {

    private String user_id;
    private String userProfile;
    
}
