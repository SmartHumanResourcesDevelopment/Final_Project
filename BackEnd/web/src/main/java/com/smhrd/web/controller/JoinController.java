package com.smhrd.web.controller;

import com.smhrd.web.DTO.SignUpRequest;
import com.smhrd.web.DTO.SignUpResponse;
import com.smhrd.web.DTO.NaverDTO;
import com.smhrd.web.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class JoinController {

    @Autowired
    private LoginService loginService;

    @PostMapping("/join")
    public ResponseEntity<SignUpResponse> join(@RequestBody SignUpRequest req) {

        System.out.println("가입 요청 데이터: " + req);

        // 네이버 가입 여부 판단
        NaverDTO naverUser = null;
        if (req.getNaverId() != null && !req.getNaverId().isEmpty()) {
            naverUser = new NaverDTO();
            naverUser.setNaverId(req.getNaverId());
            naverUser.setUser_id(req.getUser_id());
            naverUser.setPassword(req.getPassword());
            naverUser.setUsername(req.getUsername());
            naverUser.setPhone_number(req.getPhone_number());
            naverUser.setNickname(req.getNickname());
        }

        boolean success = loginService.register(req, naverUser);
        if (success)
            return ResponseEntity.ok(new SignUpResponse(true, "회원가입 완료"));
        else
            return ResponseEntity.ok(new SignUpResponse(false, "이미 존재하거나 등록 실패"));
    }
}
