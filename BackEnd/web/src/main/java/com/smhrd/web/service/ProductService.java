package com.smhrd.web.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.ProductDTO;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.repository.ChatbotMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

     private final ChatbotMapper mapper;
    
    public class ScrapException extends RuntimeException {
        public ScrapException(String message) {
            super(message);
        }
    }

    // 제품 아이디어 저장
    @Transactional
    public void productIdeas(List<ProductDTO> products, Authentication authentication) {
        System.out.println("==== [Service: productIdeas 호출됨] ====");

        // 1. Authentication 객체에서 UserDTO 추출
        UserDTO user = (UserDTO) authentication.getPrincipal();
        
        // 2. UserDTO에서 user_id(String) 값만 가져오기
        String userId = user.getUser_id();

        System.out.println("📝 저장 시도 아이템 수: " + products.size());

        for (ProductDTO product : products) {
            // 3. ProductDTO의 userId 필드에 추출한 String 값을 할당
            product.setUserId(userId);
            product.setKeywordId(1L); // 테스트 값 입력 (유효한 키워드 ID로 변경하기)
            
            System.out.println("➡ DB 저장 시도: " + product.getTitle() + " / USER_ID=" + product.getUserId());
            int result = mapper.insertProduct(product);

            if (result != 1) {
                System.out.println("❌ 저장 실패: " + product.getTitle());
                throw new RuntimeException("제품 삽입 실패");
            } else {
                System.out.println("✅ 저장 성공: " + product.getTitle());
            }
        }
    }
}