package com.smhrd.web.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.CollabDTO;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.repository.ChatbotMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CollabService {

     private final ChatbotMapper mapper;
    
    public class ScrapException extends RuntimeException {
        public ScrapException(String message) {
            super(message);
        }
    }
    // 콜라보 아이디어 저장
    @Transactional
    public void collabIdeas(List<CollabDTO> collabs, Authentication authentication) {
        System.out.println("==== [Service: collabIdeas 호출됨] ====");

        // 1. Authentication 객체에서 UserDTO 추출
        UserDTO user = (UserDTO) authentication.getPrincipal();
        
        // 2. UserDTO에서 user_id(String) 값만 가져오기
        String userId = user.getUser_id();

        System.out.println("📝 저장 시도 아이템 수: " + collabs.size());

        for (CollabDTO collab : collabs) {
            // 3. CollabDTO의 userId 필드에 추출한 String 값을 할당
            collab.setUserId(userId);
            collab.setKeywordId(1L); // 테스트 값 입력 (유효한 키워드 ID로 변경하기)
            
            System.out.println("➡ DB 저장 시도: " + collab.getTitle() + " / USER_ID=" + collab.getUserId());
            int result = mapper.insertCollab(collab);

            if (result != 1) {
                System.out.println("❌ 저장 실패: " + collab.getTitle());
                throw new RuntimeException("콜라보 삽입 실패");
            } else {
                System.out.println("✅ 저장 성공: " + collab.getTitle());
            }
        }
    }   
}