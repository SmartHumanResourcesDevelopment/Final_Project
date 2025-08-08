package com.smhrd.web.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.ProductDTO;
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
    public void productIdeas(List<ProductDTO> products) {
        System.out.println("==== [Service: productIdeas 호출됨] ====");
        System.out.println("📝 저장 시도 아이템 수: " + products.size());
        for (ProductDTO product : products) {
            System.out.println("➡ DB 저장 시도: " + product.getTitle() + " / USER_ID=" + product.getUserId());
            int result = mapper.insertProduct(product);

            if (result != 1) {
                System.out.println("❌ 저장 실패: " + product.getTitle());
                throw new RuntimeException("제품 삽입 실패");
            }else {
            System.out.println("✅ 저장 성공: " + product.getTitle());
        }
    }
}
}