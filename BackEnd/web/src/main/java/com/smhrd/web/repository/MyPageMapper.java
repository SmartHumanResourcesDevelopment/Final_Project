package com.smhrd.web.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.smhrd.web.DTO.MyPageCollabDTO;

@Mapper
public interface MyPageMapper {
    
    /**
     * 사용자의 스크랩된 콜라보 아이디어 목록 조회
     * @param userId 사용자 ID
     * @return 콜라보 아이디어 목록
     */
    List<MyPageCollabDTO> selectUserCollabIdeas(@Param("userId") String userId);

    /**
     * 특정 키워드의 콜라보 아이디어 상세 조회 (개인화)
     * @param userId 사용자 ID
     * @param keywordId 키워드 ID
     * @return 콜라보 아이디어 상세 목록
     */
    List<MyPageCollabDTO> selectCollabDetailsByKeyword(@Param("userId") String userId, @Param("keywordId") Long keywordId);

    /**
     * 키워드 이름으로 키워드 ID 조회
     * @param keywordName 키워드 이름
     * @return 키워드 ID
     */
    Long selectKeywordIdByName(@Param("keywordName") String keywordName);

    /**
     * 사용자의 스크랩된 제품 아이디어 목록 조회 (향후 확장용)
     * @param userId 사용자 ID
     * @return 제품 아이디어 목록
     */
    // List<MyPageProductDTO> selectUserProductIdeas(@Param("userId") String userId);

    /**
     * 사용자의 스크랩된 슬로건 목록 조회 (향후 확장용)
     * @param userId 사용자 ID
     * @return 슬로건 목록
     */
    // List<MyPageSloganDTO> selectUserSlogans(@Param("userId") String userId);
}
