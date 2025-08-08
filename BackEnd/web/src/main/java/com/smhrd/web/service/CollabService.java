package com.smhrd.web.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.web.DTO.CollabDTO;
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
    public void collabIdeas(List<CollabDTO> collabs) {
        for (CollabDTO collab : collabs) {
            int result = mapper.insertCollab(collab);
            if (result != 1) {
                throw new RuntimeException("콜라보 삽입 실패");
            }
        }
    }
}
