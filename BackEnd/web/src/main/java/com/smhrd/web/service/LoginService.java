package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.LoginRequest;
import com.smhrd.web.DTO.LoginResponse;
import com.smhrd.web.DTO.SignUpRequest;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.config.JwtUtil;
import com.smhrd.web.repository.UserMapper;


import lombok.extern.slf4j.Slf4j;

/** 비밀번화 암호화, 아이디 중복 체크 같은 로직 코드 작성 */
@Slf4j
@Service
public class LoginService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;



    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public boolean register(SignUpRequest req) { // 회원가입 로직

        //get naver id == null isempty{ 아래 로직 실행}

        // else{/ set>> 네이버 식별자 ? 회원가입 을 하면 사용자가 식별자 입력 안함
        // register >> 서비스로 객체 요청
        // signup.set(네이버 식별자)}



        System.out.println("가입 요청 데이터: " + req); // 로그 확인용

        int exists = userMapper.existsByUserId(req.getUser_id());

        System.out.println(" 아이디 중복 결과: " + exists); // 로그 확인용

        if (exists > 0) {
            return false;
        }
        // 비밀번호 암호화
        String encPw = passwordEncoder.encode(req.getPassword());
        req.setPassword(encPw);

        int result = userMapper.insertUser(req);
        return result > 0;

    }

    public LoginResponse login(LoginRequest req) {
          // 1) 인증 로직
        SignUpRequest userEntity = userMapper.findByUserId(req.getId());
        if (userEntity == null || 
            !passwordEncoder.matches(req.getPassword(), userEntity.getPassword())) {
            return new LoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", (String) null);
        }

        System.out.println(" 입력한정보 : "+req);
        UserDTO user = userMapper.loginUserInfo(req.getId());

        // 2) UserDTO 생성
        // UserDTO user = new UserDTO(
        //     userEntity.getUser_id(),
        //     userEntity.getUsername(),
        //     userEntity.getPhone_number(),
        //     userEntity.getNickname(),
        //     userEntity.getRole(),
        //     userEntity.getUserProfile()
        // );
        // 3) 토큰 만들기 (클레임에 유저 정보 포함)
        String token = jwtUtil.generateToken(user);

        // 4) LoginResponse에는 token만 담아 반환
        return new LoginResponse(true, "로그인 성공",token);
    }


    
}
        

