package com.smhrd.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")   // ★ CORS(포트는 상황에 맞게)
public class JoinController {
    @PostMapping("/join")
    public ResponseEntity<SignUpResponse> join(@RequestBody SignUpRequest req) {
        // ① 아이디 중복 체크, 비밀번호 암호화 등 비즈니스 로직 수행
        boolean ok = /* 서비스 계층 결과 */ true;

        if (오케이)
            return ResponseEntity.ok(new SignUpResponse(true, "회원가입 완료"));
        else
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new SignUpResponse(false, "이미 존재하는 아이디입니다."));
    }
}

    
