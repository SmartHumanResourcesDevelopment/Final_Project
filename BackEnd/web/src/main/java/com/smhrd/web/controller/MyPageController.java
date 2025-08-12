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
     * 사용자의 스크랩된 콜라보 아이디어 목록 조회
     */
    @GetMapping("/collab-ideas")
    public ResponseEntity<?> getUserCollabIdeas(Authentication authentication) {
        System.out.println("==== [마이페이지 콜라보 아이디어 조회 API 호출됨] ====");
        
        // 인증 확인
        if (authentication == null) {
            System.out.println("❌ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }
        
        try {
            // Authentication 객체에서 UserDTO 추출
            UserDTO user = (UserDTO) authentication.getPrincipal();

            // UserDTO에서 user_id(String) 값만 가져오기
            String currentUserId = user.getUser_id();

            System.out.println("👤 현재 로그인 사용자 ID: " + currentUserId);
            
            List<MyPageCollabDTO> collabIdeas = myPageService.getUserCollabIdeas(currentUserId);
            
            System.out.println("✅ 콜라보 아이디어 조회 성공 - 개수: " + collabIdeas.size());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "콜라보 아이디어 조회 성공",
                "data", collabIdeas,
                "count", collabIdeas.size()
            ));
            
        } catch (Exception e) {
            System.err.println("❌ 콜라보 아이디어 조회 실패: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 스크랩 정보를 포맷팅된 문자열로 조회 (마이페이지 UI용)
     */
    @GetMapping("/scrap-info")
    public ResponseEntity<?> getScrapInfo(Authentication authentication) {
        System.out.println("==== [마이페이지 스크랩 정보 조회 API 호출됨] ====");
        
        // 인증 확인
        if (authentication == null) {
            System.out.println("❌ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }
        
        try {
            // Authentication 객체에서 UserDTO 추출
            UserDTO user = (UserDTO) authentication.getPrincipal();

            // UserDTO에서 user_id(String) 값만 가져오기
            String currentUserId = user.getUser_id();

            System.out.println("👤 현재 로그인 사용자 ID: " + currentUserId);
            
            List<String> scrapInfo = myPageService.getFormattedScrapInfo(currentUserId);
            
            System.out.println("✅ 스크랩 정보 조회 성공 - 개수: " + scrapInfo.size());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "스크랩 정보 조회 성공",
                "data", scrapInfo,
                "count", scrapInfo.size()
            ));
            
        } catch (Exception e) {
            System.err.println("❌ 스크랩 정보 조회 실패: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 테스트용 콜라보 아이디어 추가 (개발용)
     */
    @GetMapping("/test-add-collab")
    public ResponseEntity<?> addTestCollabIdea(Authentication authentication) {
        System.out.println("==== [테스트 콜라보 아이디어 추가 API 호출됨] ====");

        // 인증 확인
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }

        try {
            // Authentication 객체에서 UserDTO 추출
            UserDTO user = (UserDTO) authentication.getPrincipal();

            // UserDTO에서 user_id(String) 값만 가져오기
            String currentUserId = user.getUser_id();

            System.out.println("👤 현재 로그인 사용자 ID: " + currentUserId);

            // 테스트 데이터 생성 (실제로는 CollabService를 통해 저장해야 함)
            // 여기서는 단순히 성공 메시지만 반환

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "테스트 콜라보 아이디어가 추가되었습니다. 실제 구현은 챗봇에서 스크랩 기능을 사용하세요.",
                "userId", currentUserId
            ));

        } catch (Exception e) {
            System.err.println("❌ 테스트 콜라보 아이디어 추가 실패: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 특정 키워드의 콜라보 아이디어 상세 조회
     */
    @GetMapping("/collab-details")
    public ResponseEntity<?> getCollabDetails(
            @RequestParam("keyword") String keywordName,
            Authentication authentication) {

        System.out.println("==== [콜라보 아이디어 상세 조회 API 호출됨] ====");
        System.out.println("키워드: " + keywordName);

        // 인증 확인
        if (authentication == null) {
            System.out.println("❌ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }

        try {
            // Authentication 객체에서 UserDTO 추출
            UserDTO user = (UserDTO) authentication.getPrincipal();

            // UserDTO에서 user_id(String) 값만 가져오기
            String currentUserId = user.getUser_id();

            System.out.println("👤 현재 로그인 사용자 ID: " + currentUserId);

            List<MyPageCollabDTO> collabDetails = myPageService.getCollabDetailsByKeyword(currentUserId, keywordName);

            System.out.println("✅ 콜라보 아이디어 상세 조회 성공 - 개수: " + collabDetails.size());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "콜라보 아이디어 상세 조회 성공",
                "data", collabDetails,
                "count", collabDetails.size(),
                "keyword", keywordName
            ));

        } catch (Exception e) {
            System.err.println("❌ 콜라보 아이디어 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}
