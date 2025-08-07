package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import java.util.Map;




@Mapper
public interface MainMapper {

    /**
     * 메인 랭킹 전용 프로시저 호출 (6개월, 1년)
     * @param params IN/OUT 파라미터를 담은 Map
     */
    void selectRankingByPeriod(Map<String, Object> params);
}
