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

import com.smhrd.web.DTO.CollabDTO;
import com.smhrd.web.service.CollabService;
import com.smhrd.web.service.CollabService.ScrapException;


@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class CollabController {

    @Autowired
    private CollabService collabService;

    // 콜라보 아이디어 저장
    @PostMapping("/collab")
    public ResponseEntity<?> CollabIdeas(@RequestBody List<CollabDTO> collabList, Authentication authentication) {
        System.out.println("==== [콜라보 API 호출됨] ====");
        System.out.println("콜라보 API 호출됨: " + collabList.size() + "개 아이템");
        try { 
            String currentUserId = authentication.getName();
            
            // 각 DTO에 인증된 사용자 ID 설정
            for (CollabDTO collab : collabList) {
            collab.setUserId(currentUserId);
            }

            collabService.collabIdeas(collabList); // List 전체 전달
            return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "콜라보 스크랩 성공",
            "count", collabList.size()
            ));
        } catch (ScrapException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

}

