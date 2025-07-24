package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.DTO.SignUpRequest;
import com.smhrd.web.DTO.SignUpResponse;
import com.smhrd.web.service.LoginService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")   // ★ CORS(포트는 상황에 맞게)
public class JoinController {
    LoginService id_check = new LoginService();
    @Autowired
    private LoginService loginService;

    @PostMapping("/join")
    public ResponseEntity<SignUpResponse> join(@RequestBody SignUpRequest req) {
        
        System.out.println("가입 요청 데이터: " + req.getId() );


        
            
        if (loginService.register(req))
            return ResponseEntity.ok(new SignUpResponse(true, "회원가입 완료"));
        else 
            return ResponseEntity.ok(new SignUpResponse(false, "이미 존재하는 아이디입니다."));
    }
}

    
