package com.smhrd.web.controller;

import com.smhrd.web.DTO.KeywordStatsDTO;
import com.smhrd.web.repository.KeywordStatsMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")

public class KeywordStatsController {

    @Autowired
    private KeywordStatsMapper keywordStatsMapper;

    @GetMapping("/keyword-stats/last7days")
    public ResponseEntity<List<KeywordStatsDTO>> getLast7DaysKeywordCounts() {
        List<KeywordStatsDTO> data = keywordStatsMapper.getLast7DaysKeywordCounts();
        if (data == null || data.isEmpty()) {
            // 데이터 없으면 204 No Content 반환
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(data);
    }
}