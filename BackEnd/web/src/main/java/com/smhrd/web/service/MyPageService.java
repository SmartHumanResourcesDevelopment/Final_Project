package com.smhrd.web.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.web.DTO.MyPageCollabDTO;
import com.smhrd.web.repository.MyPageMapper;

@Service
public class MyPageService {
    
    @Autowired
    private MyPageMapper myPageMapper;
    
    /**
     * 사용자의 모든 스크랩 정보를 문자열 형태로 포맷팅합니다.
     * @param userId 사용자 ID
     * @return 포맷팅된 전체 스크랩 정보 목록
     */
    public List<String> getFormattedScrapInfo(String userId) {
        try {
            System.out.println("🔍 모든 스크랩 정보 조회 시작 - userId: " + userId);

            // 1. 각 종류의 스크랩을 DB에서 모두 조회합니다.
            List<MyPageCollabDTO> collabIdeas = myPageMapper.selectUserCollabIdeas(userId);
            List<MyPageCollabDTO> productIdeas = myPageMapper.selectUserProductIdeas(userId); 
            List<MyPageCollabDTO> sloganIdeas = myPageMapper.selectUserSloganIdeas(userId);   

            System.out.println("✅ 콜라보(" + collabIdeas.size() + "개), 제품(" + productIdeas.size() + "개), 슬로건(" + sloganIdeas.size() + "개) 조회 완료");

            // 2. 각 목록을 "[타입] 키워드에 관한 보고서" 형식으로 변환합니다.
            Stream<String> collabStream = collabIdeas.stream().map(idea -> "[콜라보] " + idea.getKeywordName() + "에 관한 보고서");
            Stream<String> productStream = productIdeas.stream().map(idea -> "[제품] " + idea.getKeywordName() + "에 관한 보고서");
            Stream<String> sloganStream = sloganIdeas.stream().map(idea -> "[슬로건] " + idea.getKeywordName() + "에 관한 보고서");

            // 3. 세 종류의 스트림을 하나로 합치고, 키워드별 중복을 제거한 후 리스트로 만듭니다.
            List<String> allScraps = Stream.concat(collabStream, Stream.concat(productStream, sloganStream))
                                           .distinct() // 중복 제거
                                           .collect(Collectors.toList());

            System.out.println("✅ 최종 스크랩 목록 생성 완료: " + allScraps.size() + "개");
            return allScraps;

        } catch (Exception e) {
            System.err.println("❌ 스크랩 정보 포맷팅 실패: " + e.getMessage());
            return List.of("스크랩 정보를 불러오는 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 키워드와 타입에 맞는 아이디어 상세 목록을 조회합니다.
     * @param userId 사용자 ID
     * @param keywordName 키워드 이름
     * @param scrapType 스크랩 종류 ("콜라보", "제품", "슬로건")
     * @return 아이디어 상세 목록
     */
    public List<MyPageCollabDTO> getScrapDetailsByKeywordAndType(String userId, String keywordName, String scrapType) {
        try {
            System.out.println("🔍 상세 조회 시작 - userId: " + userId + ", keyword: " + keywordName + ", type: " + scrapType);

            Long keywordId = myPageMapper.selectKeywordIdByName(keywordName);
            if (keywordId == null) {
                System.err.println("❌ 키워드를 찾을 수 없습니다: " + keywordName);
                return List.of();
            }

            // scrapType에 따라 다른 mapper 메소드를 호출합니다.
            switch (scrapType) {
                case "콜라보":
                    return myPageMapper.selectCollabDetailsByKeyword(userId, keywordId);
                case "제품":
                    return myPageMapper.selectProductDetailsByKeyword(userId, keywordId); 
                case "슬로건":
                    return myPageMapper.selectSloganDetailsByKeyword(userId, keywordId);   
                default:
                    System.err.println("❌ 유효하지 않은 스크랩 타입입니다: " + scrapType);
                    return List.of();
            }

        } catch (Exception e) {
            System.err.println("❌ 스크랩 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("스크랩 상세 조회 중 오류가 발생했습니다.", e);
        }
    }

}
