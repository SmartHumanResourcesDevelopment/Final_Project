package com.smhrd.web.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.DTO.MyPageCollabDTO;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.service.MyPageService;

@RestController
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://localhost:5173")
public class MyPageController {
    
    @Autowired
    private MyPageService myPageService;
    
    /**
     * 스크랩 정보를 포맷팅된 문자열로 조회
     */
    @GetMapping("/scrap-info")
    public ResponseEntity<?> getScrapInfo(Authentication authentication) {
        System.out.println("==== [마이페이지 스크랩 정보 조회 API 호출됨] ====");
        
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }
        
        try {
            UserDTO user = (UserDTO) authentication.getPrincipal();
            String currentUserId = user.getUser_id();
            
            List<String> scrapInfo = myPageService.getFormattedScrapInfo(currentUserId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "스크랩 정보 조회 성공",
                "data", scrapInfo
            ));
            
        } catch (Exception e) {
            System.err.println("❌ 스크랩 정보 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "서버 오류: " + e.getMessage()));
        }
    }

    /**
     * 특정 키워드와 타입에 맞는 스크랩 아이디어 상세 목록을 조회합니다.
     */
    @GetMapping("/scrap-details") // 1.  API 주소를 더 명확하게 변경 
    public ResponseEntity<?> getScrapDetails(
            @RequestParam("keyword") String keywordName,
            @RequestParam("type") String scrapType, // 2. 'type' 파라미터를 추가로 받습니다. 
            Authentication authentication) {

        System.out.println("==== [스크랩 상세 조회 API 호출됨] ====");
        System.out.println("키워드: " + keywordName + ", 타입: " + scrapType);

        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "로그인이 필요합니다."));
        }

        try {
            UserDTO user = (UserDTO) authentication.getPrincipal();
            String currentUserId = user.getUser_id();

            // 3.  새로운 서비스 메소드를 호출합니다. 
            List<MyPageCollabDTO> scrapDetails = myPageService.getScrapDetailsByKeywordAndType(currentUserId, keywordName, scrapType);

            System.out.println("✅ 스크랩 상세 조회 성공 - 개수: " + scrapDetails.size());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "스크랩 상세 조회 성공",
                "data", scrapDetails,
                "keyword", keywordName,
                "type", scrapType
            ));

        } catch (Exception e) {
            System.err.println("❌ 스크랩 상세 조회 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "서버 오류: " + e.getMessage()));
        }
    }

}
