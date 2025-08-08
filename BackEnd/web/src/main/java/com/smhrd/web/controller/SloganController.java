package com.smhrd.web.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.DTO.SloganDTO;
import com.smhrd.web.service.SloganService;
import com.smhrd.web.service.SloganService.ScrapException;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class SloganController {

    @Autowired
    private SloganService sloganService;

    // 마케팅, 슬로건 저장
    @PostMapping("/slogan")
    public ResponseEntity<?> slogans(@RequestBody List<SloganDTO> sloganList, Authentication authentication) {
        System.out.println("슬로건 API 호출됨: " + sloganList.size() + "개 아이템");
        try { 
            String currentUserId = authentication.getName();
            
            // 각 DTO에 인증된 사용자 ID 설정
            for (SloganDTO slogan : sloganList) {
            slogan.setUserId(currentUserId);
            }
            
            sloganService.slogans(sloganList); // List 전체 전달
            return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "슬로건 스크랩 성공",
            "count", sloganList.size()
            ));
        } catch (ScrapException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

}

