package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.DTO.CollabDTO;
import com.smhrd.web.DTO.ProductDTO;
import com.smhrd.web.DTO.SloganDTO;
import com.smhrd.web.repository.ChatbotMapper;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatBotController {

    @Autowired
    private ChatbotMapper chatbotMapper;

    // 제품 아이디어 저장
    @PostMapping("/product")
    public ResponseEntity<String> insertProduct(@RequestBody ProductDTO product) {
        int result = chatbotMapper.insertProduct(product);

        if(result > 0){
            return ResponseEntity.ok("success");
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }

    // 콜라보 아이디어 저장
    @PostMapping("/collab")
    public ResponseEntity<String> insertCollab(@RequestBody CollabDTO collab) {
        int result = chatbotMapper.insertCollab(collab);

       if(result > 0){
            return ResponseEntity.ok("success");
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }

    // 슬로건, 마케팅 저장 
    @PostMapping("/slogan")
    public ResponseEntity<String> insertSlogan(@RequestBody SloganDTO slogan) {
        int result = chatbotMapper.insertSlogan(slogan);
        
        if(result > 0){
            return ResponseEntity.ok("success");
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
}

}
