package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.smhrd.web.DTO.SignUpRequest;
import com.smhrd.web.DTO.UserInfoUpdate_DTO;


@Mapper
public interface UserMapper {
    
    int existsByUserId(@Param("id") String id); // 아이디 중복 확인

    int insertUser(SignUpRequest req); // 회원가입

    SignUpRequest findByUserId(String user_input_id); // 사용자 로그인(비교용)

    // 사용자 정보 수정
    int UserInfoUpdate(UserInfoUpdate_DTO dto);

    /** 이미지 수정  */
    int updateUserProfileById(String userId, String imageUrl);

    void  restUserProfile(String user_id);

    
    /**회원 탈퇴  */
    void userInfoDelete(String userId);


}
