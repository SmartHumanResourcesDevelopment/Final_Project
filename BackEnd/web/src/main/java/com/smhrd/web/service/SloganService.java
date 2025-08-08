package com.smhrd.web.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.SloganDTO;
import com.smhrd.web.repository.ChatbotMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SloganService {

     private final ChatbotMapper mapper;
    
    public class ScrapException extends RuntimeException {
        public ScrapException(String message) {
            super(message);
        }
    }
    // 마케팅, 슬로건 저장
    @Transactional
    public void slogans(List<SloganDTO> slogans) {
        for (SloganDTO slogan : slogans) {
            int result = mapper.insertSlogan(slogan);
            if (result != 1) {
                throw new RuntimeException("슬로건 삽입 실패");
            }
        }
    }
}
