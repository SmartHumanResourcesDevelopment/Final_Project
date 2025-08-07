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

}
