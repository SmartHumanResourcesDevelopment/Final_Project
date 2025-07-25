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

        System.out.println("가입 요청 데이터: " + req.getUser_id()); // 로그 확인용

        int exists = userMapper.existsByUserId(req.getUser_id());

        System.out.println(" 아이디 중복 결과: " + exists); // 로그 확인용

        if (exists > 0) {
            return false;
        }
        // 비밀번호 암호화
        String encPw = passwordEncoder.encode(req.getPassword());
        req.setPassword(encPw);

        // 데이터 베이스에 저장
        req.setRole("팀원");
        int result = userMapper.insertUser(req);
        return result > 0;

    }

    public LoginResponse login(LoginRequest req) {
        
        try {
            log.info("로그인 시도: 사용자 ID = {}", req.getId()); // 로그인 시도 로그

            SignUpRequest user = userMapper.findByUserId( req.getId());
            String token = jwtUtil.generateToken(user.getUser_id());
            if (user == null) {
                log.warn("로그인 실패: 존재하지 않는 ID {}",  req.getId()); // 아이디가 없다 로그
                return new LoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null,token);
            }

            if (!passwordEncoder.matches( req.getPassword(), user.getPassword())) {
                log.warn("로그인 실패: 비밀번호 불일치 - ID {}", req.getPassword()); // 비밀번호가 불일치하다 로그
                return new LoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null,token);
            }

            log.info("로그인 성공: 사용자 이름 = {}", user); // 로그인 성공 로그
            UserDTO userinfo = new UserDTO(user.getUser_id(),user.getUsername(),user.getPhone_number(),user.getNickname(),user.getRole());
            return new LoginResponse(true, "로그인 성공", userinfo,token);

        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e); // 로그인 처리중 오류 로그
            return new LoginResponse(false, "시스템 오류가 발생했습니다", null,null);
        }
        
    }
}
