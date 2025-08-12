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

import com.smhrd.web.DTO.ProductDTO;
import com.smhrd.web.DTO.ChatBotIdeaDTO;
import com.smhrd.web.DTO.CollabRequestDTO;
import com.smhrd.web.service.ProductService;
import com.smhrd.web.service.ChatbotService;
import com.smhrd.web.service.ProductService.ScrapException;


@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    // DB저장 서비스
    @Autowired
    private ProductService productService;

    // AI 생성용 서비스
    @Autowired
    private ChatbotService chatbotService;

    // 제품 아이디어 저장
    @PostMapping("/product")
    public ResponseEntity<?> ProductIdeas(@RequestBody List<ProductDTO> productList, Authentication authentication) {
        System.out.println("==== [제품 API 호출됨] ====");
        System.out.println("제품 API 호출됨 : " + productList.size() + "개 아이템");
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
            for (ProductDTO product : productList) {
            product.setUserId(currentUserId);
            System.out.println("➡ 저장 준비: " + product.getTitle());
            }

            productService.productIdeas(productList, authentication); // List 전체 전달
            System.out.println("✅ 제품 스크랩 성공");
            return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "제품 스크랩 성공",
            "count", productList.size()
            ));
        } catch (ScrapException e) {
            System.out.println("❌ 스크랩 예외 발생: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    // 신규: AI로 제품 아이디어 생성 API
    @PostMapping("/product/generate")
    public ResponseEntity<List<ChatBotIdeaDTO>> generateProductIdeas(@RequestBody CollabRequestDTO request) {
        System.out.println("==== [AI 제품 생성 API 호출됨] ====");
        System.out.println("키워드: " + request.getKeyword());
        
        List<ChatBotIdeaDTO> ideas = chatbotService.generateProductIdeas(request.getKeyword());
        return ResponseEntity.ok(ideas);
    }
}

