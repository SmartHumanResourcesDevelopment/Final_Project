package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smhrd.web.service.DetailKeywordService;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/keyword")
public class DetaiKeywordController {

    @Autowired
    private DetailKeywordService detailKeywordService;

    /**
     * 서버 상태 확인용 테스트 엔드포인트
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        System.out.println("🧪 테스트 엔드포인트 호출됨!");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "서버가 정상 작동 중입니다");
        response.put("timestamp", new java.util.Date());
        return ResponseEntity.ok(response);
    }

    /**
     * 키워드 검색 및 상세 정보 조회
     * @param keywordName 검색할 키워드명
     * @return 키워드 상세 정보 (통계, 유사도 등)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchKeyword(
            @RequestParam("keyword") String keywordName) {

        System.out.println("=================================================");
        System.out.println("🔍 키워드 검색 API 호출됨 - 키워드: " + keywordName);
        System.out.println("📍 API URL: http://localhost:8095/zal/api/keyword/search?keyword=" + keywordName);
        System.out.println("=================================================");

        try {
            Map<String, Object> response = detailKeywordService.getKeywordDetails(keywordName);
            System.out.println("➡️ response keys: " + response.keySet());
            System.out.println("➡️ response.ranking: " + response.get("ranking") + " (" + (response.get("ranking")!=null?response.get("ranking").getClass().getName():"null") + ")");
            if (response.get("keywordInfo") == null) {
                System.out.println("⚠️ 키워드를 찾을 수 없음: " + keywordName);
                return ResponseEntity.notFound().build();
            }

            System.out.println("✅ 키워드 검색 성공: " + keywordName);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 키워드 검색 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 감성분석 조회 (별도 API)
     * @param keywordName 키워드명
     * @param period 기간 (전체, 최신순(3개월))
     * @return 감성분석 결과
     */
    @GetMapping("/sentiment")
    public ResponseEntity<Map<String, Object>> getKeywordSentiment(
            @RequestParam("keyword") String keywordName,
            @RequestParam(value = "period", defaultValue = "전체") String period) {

        System.out.println("=================================================");
        System.out.println("🎯 감성분석 API 호출됨 - 키워드: " + keywordName + ", 기간: " + period);
        System.out.println("📍 API URL: http://localhost:8095/zal/api/keyword/sentiment?keyword=" + keywordName + "&period=" + period);
        System.out.println("=================================================");

        try {
            Map<String, Object> response = detailKeywordService.getKeywordSentimentAnalysis(keywordName, period);

            if (response.containsKey("error")) {
                System.out.println("⚠️ 감성분석 오류: " + response.get("error"));
                return ResponseEntity.badRequest().body(response);
            }

            System.out.println("✅ 감성분석 성공: " + keywordName);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 감성분석 API 오류: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "감성분석 조회 중 오류가 발생했습니다.");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", new java.util.Date());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * 키워드 자동완성 검색
     * @param query 검색 쿼리
     * @return 자동완성 키워드 목록
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<Map<String, Object>> autocompleteKeywords(
            @RequestParam("q") String query) {

        System.out.println("🔍 키워드 자동완성 API 호출됨 - 쿼리: " + query);

        try {
            Map<String, Object> response = detailKeywordService.getAutocompleteKeywords(query);
            System.out.println("✅ 자동완성 검색 성공");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 자동완성 검색 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 인기 키워드 목록 조회
     * @return 인기 키워드 목록
     */
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularKeywords() {

        System.out.println("🔍 인기 키워드 API 호출됨");

        try {
            Map<String, Object> response = detailKeywordService.getPopularKeywords();
            System.out.println("✅ 인기 키워드 조회 성공");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 인기 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 디버그용: 모든 키워드 목록 조회
     * @return 모든 키워드 목록
     */
    @GetMapping("/debug/all")
    public ResponseEntity<Map<String, Object>> getAllKeywords() {

        System.out.println("🔍 디버그: 모든 키워드 조회 API 호출됨");

        try {
            List<Map<String, Object>> allKeywords = detailKeywordService.getAllKeywords();

            Map<String, Object> response = new HashMap<>();
            response.put("keywords", allKeywords);
            response.put("count", allKeywords.size());

            System.out.println("✅ 모든 키워드 조회 성공: " + allKeywords.size() + "개");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 모든 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 키워드 일별 통계 조회
     * @param keywordName 키워드명
     * @param period 조회 기간 (1일, 1주, 1달, 1년)
     * @return 일별 통계 데이터
     */
    @GetMapping("/daily-stats")
    public ResponseEntity<Map<String, Object>> getKeywordDailyStats(
            @RequestParam("keyword") String keywordName,
            @RequestParam(value = "period", defaultValue = "1주") String period) {

        System.out.println("📊 키워드 일별 통계 API 호출됨 - 키워드: " + keywordName + ", 기간: " + period);

        try {
            Map<String, Object> response = detailKeywordService.getKeywordDailyStats(keywordName, period);
            System.out.println("✅ 일별 통계 조회 성공: " + keywordName);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ 일별 통계 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
