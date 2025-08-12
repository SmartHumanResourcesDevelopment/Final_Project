package com.smhrd.web.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.ProductDTO;
import com.smhrd.web.DTO.UserDTO;
import com.smhrd.web.repository.ChatbotMapper;
import com.smhrd.web.repository.KeywordMapper; 

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ChatbotMapper mapper;
    private final KeywordMapper keywordMapper; 
    
    public class ScrapException extends RuntimeException {
        public ScrapException(String message) {
            super(message);
        }
    }

    // 제품 아이디어 저장
    @Transactional
    public void productIdeas(List<ProductDTO> products, Authentication authentication) {
        System.out.println("==== [Service: productIdeas 호출됨] ====");

        UserDTO user = (UserDTO) authentication.getPrincipal();
        String userId = user.getUser_id();

        System.out.println("📝 저장 시도 아이템 수: " + products.size());

        for (ProductDTO product : products) {
            // 1.  키워드 이름으로 DB에서 실제 keyword_id를 조회합니다. 
            Long keywordId = keywordMapper.getKeywordIdByName(product.getKeywordName());
            
            // 2. 조회된 ID가 없으면 에러를 발생시킵니다. 
            if (keywordId == null) {
                throw new RuntimeException("유효하지 않은 키워드입니다: " + product.getKeywordName());
            }
            
            // 3.  조회된 ID를 DTO에 설정합니다. 
            product.setKeywordId(keywordId);
            product.setUserId(userId);
            
            System.out.println("➡ DB 저장 시도: " + product.getTitle() + " / KEYWORD_ID=" + product.getKeywordId());
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
