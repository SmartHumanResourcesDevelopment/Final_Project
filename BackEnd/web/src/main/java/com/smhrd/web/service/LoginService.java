package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.LoginRequest;
import com.smhrd.web.DTO.LoginResponse;
import com.smhrd.web.DTO.NaverDTO;
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
    public boolean register(SignUpRequest req, NaverDTO naverUser) {
        if (naverUser != null && naverUser.getNaverId() != null && !naverUser.getNaverId().isEmpty()) {
        System.out.println("네이버 회원가입 요청: " + naverUser);

        // 비밀번호 암호화
        String encPw = passwordEncoder.encode(req.getPassword());
        naverUser.setPassword(encPw);

        // 네이버 유저 기본값
        if (naverUser.getNaverlogincheck() == null) {
            naverUser.setNaverlogincheck("네이버유저");
        }
        if (naverUser.getUserProfile() == null) {
            naverUser.setUserProfile("/uploads/default/user.png");
        }
        if (naverUser.getRole() == null) {
            naverUser.setRole("팀원");
        }
        naverUser.setUser_id(req.getUser_id()); // 일반 입력값과 연결

        int result = userMapper.insertNaverUser(naverUser);
        return result > 0;
        } else {
            // 일반 회원가입
            System.out.println("일반 회원가입 요청: " + req);

            if (req.getNaverlogincheck() == null) {
            req.setNaverlogincheck("잇픽유저");
        }
            int exists = userMapper.existsByUserId(req.getUser_id());
            if (exists > 0) return false;

            String encPw = passwordEncoder.encode(req.getPassword());
            req.setPassword(encPw);

            int result = userMapper.insertUser(req);
            return result > 0;
        }
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
        

