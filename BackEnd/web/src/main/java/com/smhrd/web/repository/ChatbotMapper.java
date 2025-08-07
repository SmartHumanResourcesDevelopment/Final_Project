package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;

import com.smhrd.web.DTO.CollabDTO;
import com.smhrd.web.DTO.ProductDTO;
import com.smhrd.web.DTO.SloganDTO;

@Mapper
public interface ChatbotMapper {
    
    // 제품 아이디어 스크랩 저장 기능
    int insertProduct(ProductDTO product);

    // 콜라보 아이디어 스크랩 저장 기능
    int insertCollab(CollabDTO collab);

    // 슬로건, 마케팅 문구 스크랩 저장 기능
    int insertSlogan(SloganDTO slogan);

}
