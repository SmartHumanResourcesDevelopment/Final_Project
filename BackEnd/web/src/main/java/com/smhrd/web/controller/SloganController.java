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
import com.smhrd.web.service.ChatbotService;
import com.smhrd.web.DTO.ChatBotIdeaDTO;
import com.smhrd.web.DTO.CollabRequestDTO;
import com.smhrd.web.service.SloganService;
import com.smhrd.web.service.ChatbotService; 
import com.smhrd.web.service.SloganService.ScrapException;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class SloganController {

    // DB저장 서비스
    @Autowired
    private SloganService sloganService;

    // AI 생성용 서비스
    @Autowired
    private ChatbotService chatbotService;    

    // 마케팅, 슬로건 저장
    @PostMapping("/slogan")
    public ResponseEntity<?> Slogans(@RequestBody List<SloganDTO> sloganList, Authentication authentication) {
        System.out.println("==== [슬로건 API 호출됨] ====");
        System.out.println("슬로건 API 호출됨 : " + sloganList.size() + "개 아이템");
        System.out.println("Authentication : " + authentication);
        
        // 인증 객체 null 여부 체크
        if (authentication == null) {
            System.out.println("❌ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }
        
        try { 
            String currentUserId = authentication.getName();
            System.out.println("👤 현재 로그인 사용자 ID: " + currentUserId);

            // 각 DTO에 인증된 사용자 ID 설정
            for (SloganDTO slogan : sloganList) {
            slogan.setUserId(currentUserId);
            System.out.println("➡ 저장 준비: " + slogan.getTitle());
            }

            sloganService.slogans(sloganList, authentication); // List 전체 전달
            System.out.println("✅ 슬로건 스크랩 성공");
            return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "슬로건 스크랩 성공",
            "count", sloganList.size()
            ));
        } catch (ScrapException e) {
            System.out.println("❌ 스크랩 예외 발생: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    // AI로 슬로건 생성 API
    @PostMapping("/slogan/generate")
    public ResponseEntity<List<ChatBotIdeaDTO>> generateSlogans(@RequestBody CollabRequestDTO request) {
        System.out.println("==== [AI 슬로건 생성 API 호출됨] ====");
        System.out.println("키워드: " + request.getKeyword());
        
        List<ChatBotIdeaDTO> ideas = chatbotService.generateSlogans(request.getKeyword());
        return ResponseEntity.ok(ideas);
    }
}

