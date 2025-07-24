package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.DTO.LoginRequest;
import com.smhrd.web.DTO.LoginResponse;
import com.smhrd.web.service.LoginService;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginController {
    
    @Autowired
    private LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpSession session) {
        LoginResponse response = loginService.login(req);

        log.info("로그인 요청 데이터: {}", req.getId());

        if (!response.isSuccess()) {
        return ResponseEntity
            .status(401) // 혹은 400, 403  선택
            .body(response);
    }
        session.setAttribute("loginUser", response.getUser());
        return ResponseEntity.ok(response);
    }
}
