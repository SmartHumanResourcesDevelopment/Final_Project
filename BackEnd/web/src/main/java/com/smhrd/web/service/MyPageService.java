package com.smhrd.web.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.web.DTO.MyPageCollabDTO;
import com.smhrd.web.repository.MyPageMapper;

@Service
public class MyPageService {
    
    @Autowired
    private MyPageMapper myPageMapper;
    
    /**
     * 사용자의 스크랩된 콜라보 아이디어 목록 조회
     * @param userId 사용자 ID
     * @return 콜라보 아이디어 목록
     */
    public List<MyPageCollabDTO> getUserCollabIdeas(String userId) {
        try {
            System.out.println("🔍 사용자 콜라보 아이디어 조회 시작 - userId: " + userId);
            System.out.println("🔍 실행할 SQL: SELECT c.*, k.KEYWORD_NAME FROM USER_COLLAB_IDEA c LEFT JOIN KEYWORD k ON c.KEYWORD_ID = k.KEYWORD_ID WHERE c.USER_ID = '" + userId + "'");

            List<MyPageCollabDTO> collabIdeas = myPageMapper.selectUserCollabIdeas(userId);

            System.out.println("✅ 콜라보 아이디어 조회 완료 - 개수: " + collabIdeas.size());

            // 로그로 조회된 데이터 확인
            if (collabIdeas.isEmpty()) {
                System.out.println("⚠️ 조회된 콜라보 아이디어가 없습니다. 다음을 확인하세요:");
                System.out.println("   1. USER_COLLAB_IDEA 테이블에 해당 사용자의 데이터가 있는지");
                System.out.println("   2. 사용자 ID가 정확한지: '" + userId + "'");
                System.out.println("   3. 콜라보 아이디어를 실제로 스크랩했는지");
            } else {
                for (MyPageCollabDTO idea : collabIdeas) {
                    System.out.println("📋 콜라보 아이디어: " + idea.getTitle() + " (키워드: " + idea.getKeywordName() + ")");
                }
            }

            return collabIdeas;
            
        } catch (Exception e) {
            System.err.println("❌ 콜라보 아이디어 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("콜라보 아이디어 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 스크랩 정보를 문자열 형태로 포맷팅 (키워드별 중복 제거)
     * @param userId 사용자 ID
     * @return 포맷팅된 스크랩 정보 목록
     */
    public List<String> getFormattedScrapInfo(String userId) {
        try {
            List<MyPageCollabDTO> collabIdeas = getUserCollabIdeas(userId);

            // 키워드별로 중복 제거 (키워드 이름 기준)
            return collabIdeas.stream()
                .map(idea -> "[콜라보] " + idea.getKeywordName() + "에 관한 보고서")
                .distinct() // 중복 제거
                .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("❌ 스크랩 정보 포맷팅 실패: " + e.getMessage());
            // 기본값 반환
            return List.of("[콜라보] 데이터 로딩 중...");
        }
    }

    /**
     * 특정 키워드의 콜라보 아이디어 상세 조회
     * @param userId 사용자 ID
     * @param keywordName 키워드 이름
     * @return 콜라보 아이디어 상세 목록
     */
    public List<MyPageCollabDTO> getCollabDetailsByKeyword(String userId, String keywordName) {
        try {
            System.out.println("🔍 콜라보 아이디어 상세 조회 시작 - userId: " + userId + ", keyword: " + keywordName);

            // 키워드 이름으로 키워드 ID 조회
            Long keywordId = myPageMapper.selectKeywordIdByName(keywordName);

            if (keywordId == null) {
                System.err.println("❌ 키워드를 찾을 수 없습니다: " + keywordName);
                return List.of();
            }

            System.out.println("🔍 키워드 ID: " + keywordId);

            // 해당 키워드의 모든 콜라보 아이디어 조회
            List<MyPageCollabDTO> collabDetails = myPageMapper.selectCollabDetailsByKeyword(userId, keywordId);

            System.out.println("✅ 콜라보 아이디어 상세 조회 완료 - 개수: " + collabDetails.size());

            // 로그로 조회된 데이터 확인
            for (MyPageCollabDTO detail : collabDetails) {
                String displayTitle = detail.getContentTitle() != null ? detail.getContentTitle() : detail.getTitle();
                System.out.println("📋 상세 아이디어: " + displayTitle);
                System.out.println("   - 내용1: " + detail.getContentDesc1());
                System.out.println("   - 내용2: " + detail.getContentDesc2());
                System.out.println("   - 내용3: " + detail.getContentDesc3());
            }

            return collabDetails;

        } catch (Exception e) {
            System.err.println("❌ 콜라보 아이디어 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("콜라보 아이디어 상세 조회 중 오류가 발생했습니다.", e);
        }
    }
}
