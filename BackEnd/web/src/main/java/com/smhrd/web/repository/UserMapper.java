package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.smhrd.web.DTO.SignUpRequest;
import com.smhrd.web.DTO.UserDTO;
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


    // 로그인 후 유저 정보 가져오기
    UserDTO loginUserInfo(String user_id);

    // 네이버 ID 기준으로 가입 여부 확인
    int existsByUserNaver(@Param("userId") String userId);

    // 네이버 ID 기준으로 유저 정보 조회
    UserDTO findByUserNaver(@Param("userId") String userId);

    // 네이버 유저 등록
    int insertNaverUser(UserDTO user);

}
