package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface DetailKeywordMapper {

    /**
     * 키워드명으로 키워드 기본 정보 조회
     * @param keywordName 키워드명
     * @return 키워드 기본 정보
     */
    Map<String, Object> getKeywordByName(@Param("keywordName") String keywordName);

    /**
     * 디버그용: 모든 키워드 조회
     * @return 모든 키워드 목록
     */
    List<Map<String, Object>> getAllKeywords();

    /**
     * 키워드 메인 통계 조회
     * @param keywordId 키워드 ID
     * @return 키워드 메인 통계 목록
     */
    List<Map<String, Object>> getKeywordMainStats(@Param("keywordId") Long keywordId);

    /**
     * 키워드 유사도 정보 조회
     * @param keywordId 키워드 ID
     * @return 키워드 유사도 정보
     */
    Map<String, Object> getKeywordSimilarity(@Param("keywordId") Long keywordId);

    /**
     * 키워드 자동완성 검색
     * @param query 검색 쿼리
     * @return 자동완성 키워드 목록
     */
    List<Map<String, Object>> getAutocompleteKeywords(@Param("query") String query);

    /**
     * 인기 키워드 목록 조회
     * @return 인기 키워드 목록
     */
    List<Map<String, Object>> getPopularKeywords();

    /**
     * 유사 키워드 상세 정보 조회
     * @param keywordIds 유사 키워드 ID 목록
     * @return 유사 키워드 상세 정보 목록
     */
    List<Map<String, Object>> getSimilarKeywordDetails(@Param("keywordIds") List<Long> keywordIds);

    /**
     * 키워드 ID로 키워드 정보 조회
     * @param keywordId 키워드 ID
     * @return 키워드 정보
     */
    Map<String, Object> getKeywordById(@Param("keywordId") Long keywordId);

    /**
     * 키워드 일별 통계 조회 (기간별)
     * @param keywordId 키워드 ID
     * @param period 조회 기간 (1일, 1주, 1달, 1년)
     * @return 일별 통계 목록
     */
    List<Map<String, Object>> getKeywordDailyStatsByPeriod(@Param("keywordId") Long keywordId, @Param("period") String period);

    /**
     * 키워드 감성분석 결과 조회 (감정별 상세 카운트)
     * @param params 파라미터 맵 (keywordId, onlyMain)
     * @return 감정별 상세 카운트 목록
     */
    List<Map<String, Object>> getKeywordSentimentAnalysis(Map<String, Object> params);

    /**
     * 키워드 관련 랜덤 댓글 조회
     * @param params 파라미터 맵 (keywordId, limit)
     * @return 랜덤 댓글 목록
     */
    List<Map<String, Object>> getRandomCommentsByKeyword(Map<String, Object> params);

    /**
     * 키워드 관련 데이터 존재 여부 확인
     * @param keywordId 키워드 ID
     * @return 데이터 카운트 정보
     */
    Map<String, Object> checkKeywordData(@Param("keywordId") Long keywordId);

    /**
     * 특정 감정에 해당하는 댓글 조회
     * @param params 파라미터 맵 (keywordId, emotion, limit)
     * @return 감정별 댓글 목록
     */
    List<Map<String, Object>> getCommentsByEmotion(Map<String, Object> params);

    /**
     * 키워드 감정별 상세 카운트 조회
     * @param params 파라미터 맵 (keywordId, onlyMain)
     * @return 감정별 상세 카운트 목록
     */
    List<Map<String, Object>> getKeywordDetailedSentiments(Map<String, Object> params);

    /**
     * 전체 키워드 랭킹 조회 (프로시저 호출)
     * @return 전체 키워드 랭킹 데이터
     */
    List<Map<String, Object>> getOverallRankingAll();

    // 추가: 특정 키워드의 전체 랭킹(한 건)
    Map<String, Object> getKeywordOverallRank(String keywordName);

    /**
     * 키워드의 마지막 언급일 조회
     * @param keywordId 키워드 ID
     * @return 마지막 언급일 정보
     */
    Map<String, Object> getLastMentionDate(@Param("keywordId") Long keywordId);

    /**
     * 특정 감정과 플랫폼의 댓글 조회
     * @param params 조회 파라미터 (keywordId, emotion, platform, limit)
     * @return 댓글 목록
     */
    List<Map<String, Object>> getCommentsByEmotionAndPlatform(Map<String, Object> params);

}
