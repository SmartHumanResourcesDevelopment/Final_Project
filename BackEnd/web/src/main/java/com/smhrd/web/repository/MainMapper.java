package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import java.util.Map;
import java.util.List;




@Mapper
public interface MainMapper {

    /**
     * 메인 랭킹 전용 프로시저 호출 (6개월, 1년)
     * @param params IN/OUT 파라미터를 담은 Map
     */
    void selectRankingByPeriod(Map<String, Object> params);

    /**
     * 급상승 키워드 TOP3 조회 (최근 30일)
     * @return 키워드명, 언급량, 언급일수
     */
    List<Map<String, Object>> getTrendingKeywordsRecent30Days();

    /**
     * 급상승 키워드 TOP3 조회 (최근 60일)
     * @return 키워드명, 언급량, 언급일수
     */
    List<Map<String, Object>> getTrendingKeywordsRecent60Days();

    /**
     * 급상승 키워드 TOP3 조회 (최근 90일)
     * @return 키워드명, 언급량, 언급일수
     */
    List<Map<String, Object>> getTrendingKeywordsRecent90Days();

    /**
     * 급상승 키워드 TOP3 조회 (가장 최근 데이터 3개 랜덤)
     * @return 키워드명, 언급량, 언급일수
     */
    List<Map<String, Object>> getTrendingKeywordsLatest();

    /**
     * 특정 키워드의 일별 언급량 조회 (최근 N일)
     * @param keyword 키워드명
     * @param days 조회할 일수
     * @return 일별 언급량 리스트
     */
    List<Integer> getDailyKeywordMentions(String keyword, int days);

    /**
     * 추가 급상승 키워드 조회 (TOP15 제외, 더 넓은 범위)
     * @param limit 조회할 개수
     * @return 추가 키워드 데이터
     */
    List<Map<String, Object>> getAdditionalTrendingKeywords(int limit);

    /**
     * 전체 키워드 랭킹 조회 (랜덤 키워드 선택용)
     * @return 전체 키워드 랭킹 데이터
     */
    List<Map<String, Object>> getOverallRankingAll();



}
