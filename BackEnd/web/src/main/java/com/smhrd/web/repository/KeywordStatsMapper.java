package com.smhrd.web.repository;

import com.smhrd.web.DTO.KeywordStatsDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface KeywordStatsMapper {
    List<KeywordStatsDTO> getLast7DaysKeywordCounts();
}