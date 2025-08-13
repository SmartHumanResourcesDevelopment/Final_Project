package com.smhrd.web.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface KeywordMapper {
    Long getKeywordIdByName(@Param("keywordName") String keywordName);
}
