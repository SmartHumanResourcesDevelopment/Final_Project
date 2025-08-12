package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smhrd.web.service.MainService;

import java.util.*;

@RestController
@RequestMapping("/api/main")
public class MainController {

    @Autowired
    private MainService mainService;

    // CORS 테스트용 간단한 API
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        System.out.println("🧪 테스트 API 호출됨");
        Map<String, Object> response = Map.of(
            "message", "CORS 테스트 성공!",
            "timestamp", new Date(),
            "status", "OK",
            "contextPath", "/zal"
        );
        return ResponseEntity.ok(response);
    }


    // 1. 키워드 랭킹 TOP 10 (Main_rank 컴포넌트용)
    @GetMapping("/ranking")
    public ResponseEntity<Map<String, Object>> getRanking(
            @RequestParam(defaultValue = "6개월") String period) {

        System.out.println("🚀 랭킹 API 호출됨 - 기간: " + period);

        try {
            // 서비스에서 랭킹 데이터 조회
            Map<String, Object> response = mainService.getRanking(period);
            System.out.println("✅ 랭킹 데이터 조회 성공 - 데이터 수: " +
                ((List<?>) response.get("data")).size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // 에러 발생 시 에러 응답
            System.err.println("❌ 랭킹 데이터 조회 실패: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = Map.of(
                "error", "랭킹 데이터 조회 실패",
                "message", e.getMessage(),
                "period", period,
                "timestamp", new Date()
            );
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // 2. 키워드 TOP 3 (Main_top3 컴포넌트용)
    @GetMapping("/top3")
    public ResponseEntity<Map<String, Object>> getTop3Keywords() {
        System.out.println("🎯 TOP3 키워드 API 호출됨");

        try {
            Map<String, Object> response = mainService.getTop3Keywords();
            System.out.println("✅ TOP3 키워드 응답 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ TOP3 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 더미 데이터 반환
            List<Map<String, Object>> dummyData = Arrays.asList(
                Map.of("rank", 1, "keyword", "탕후루", "count", 1020, "trend", "⬆", "color", "#e60000", "description", "달콤한 중국 전통 간식"),
                Map.of("rank", 2, "keyword", "마라탕", "count", 980, "trend", "↔", "color", "#ff6600", "description", "얼얼한 중국식 훠궈"),
                Map.of("rank", 3, "keyword", "제로음료", "count", 903, "trend", "⬇", "color", "#ff6600", "description", "칼로리 제로 음료")
            );

            Map<String, Object> errorResponse = Map.of(
                "data", dummyData,
                "totalMentions", 2903,
                "lastUpdated", new Date()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    

    // 4. TOP3 인사이트 차트 데이터 (Main_top3_insight 컴포넌트용)
    @GetMapping("/top3/insights")
    public ResponseEntity<Map<String, Object>> getTop3Insights(
            @RequestParam(defaultValue = "월") String period) {
        System.out.println("📊 TOP3 인사이트 API 호출됨 - 기간: " + period);

        try {
            System.out.println("📊 TOP3 인사이트 데이터 조회 중...");
            Map<String, Object> response = mainService.getTop3Insights(period);
            System.out.println("📊 기본 인사이트 데이터 조회 완료: " + response.keySet());

            // OpenAI 요약 추가
            @SuppressWarnings("unchecked")
            List<String> keywords = (List<String>) response.get("keywords");
            System.out.println("📊 추출된 키워드 목록: " + keywords);

            String aiSummary = mainService.generateTop3InsightSummary(keywords, period);
            response.put("aiSummary", aiSummary);
            System.out.println("📊 최종 응답에 AI 요약 추가 완료");
            System.out.println("📊 추가된 AI 요약 내용: " + aiSummary);

            System.out.println("✅ TOP3 인사이트 응답 성공 (AI 요약 포함)");
            System.out.println("📊 최종 응답 키: " + response.keySet());
            System.out.println("📊 최종 응답 전체: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ TOP3 인사이트 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 더미 데이터 반환
            List<Map<String, Object>> dummyChartData = Arrays.asList(
                Map.of("period", "02월", "먹방", 35, "간식", 12, "딸기", 8),
                Map.of("period", "03월", "먹방", 42, "간식", 15, "딸기", 25),
                Map.of("period", "04월", "먹방", 48, "간식", 18, "딸기", 32),
                Map.of("period", "05월", "먹방", 55, "간식", 22, "딸기", 28),
                Map.of("period", "06월", "먹방", 62, "간식", 28, "딸기", 15),
                Map.of("period", "07월", "먹방", 78, "간식", 35, "딸기", 12)
            );

            Map<String, Object> errorResponse = Map.of(
                "chartData", dummyChartData,
                "keywords", Arrays.asList("먹방", "간식", "딸기"),
                "period", period,
                "aiSummary", "먹방, 간식, 딸기 키워드가 최근 " + period + "별 트렌드에서 주목받고 있습니다. 특히 먹방 콘텐츠의 지속적인 성장과 간식 트렌드의 다양화, 계절성 과일인 딸기의 변화하는 인기도를 확인할 수 있습니다.",
                "lastUpdated", new Date()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    // 3. 급상승 키워드 TOP3 (Main_Trending 컴포넌트용)
    @GetMapping("/trending")
    public ResponseEntity<Map<String, Object>> getTrendingKeywords() {
        System.out.println("📈 급상승 키워드 TOP3 API 호출됨");

        try {
            Map<String, Object> response = mainService.getTrendingKeywords();
            System.out.println("✅ 급상승 키워드 응답 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 급상승 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 빈 데이터 반환 (더미 데이터 주석 처리)
            /*
            Map<String, Object> errorResponse = Map.of(
                "trendingKeywords", Arrays.asList(
                    Map.of("keyword", "먹방", "count", 1250, "growth", "+45%", "rank", 1),
                    Map.of("keyword", "간식", "count", 980, "growth", "+32%", "rank", 2),
                    Map.of("keyword", "딸기", "count", 756, "growth", "+28%", "rank", 3)
                ),
                "period", "최근 30일",
                "lastUpdated", new Date()
            );
            */

            Map<String, Object> errorResponse = Map.of(
                "trendingKeywords", new ArrayList<>(),
                "period", "에러 발생",
                "lastUpdated", new Date(),
                "error", e.getMessage()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    // 5. 급상승 인사이트 차트 데이터 (Main_Trending_insight 컴포넌트용)
    @GetMapping("/trending/insights")
    public ResponseEntity<Map<String, Object>> getTrendingInsights() {
        System.out.println("📈 급상승 인사이트 차트 API 호출됨");

        try {
            Map<String, Object> response = mainService.getTrendingInsights();
            System.out.println("✅ 급상승 인사이트 응답 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 급상승 인사이트 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 빈 데이터 반환
            Map<String, Object> errorResponse = Map.of(
                "labels", Arrays.asList(),
                "datasets", Arrays.asList(),
                "aiAnalysis", "데이터 조회 중 오류가 발생했습니다.",
                "error", e.getMessage()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    // 6. 검색 자동완성 (Main_search 컴포넌트용)
    @GetMapping("/search/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(
            @RequestParam String query) {

        // TODO: 실제 DB에서 검색 자동완성 데이터 조회
        List<String> suggestions = Arrays.asList(
            "탕후루 맛집",
            "탕후루 만들기",
            "탕후루 칼로리",
            "마라탕 레시피",
            "마라탕 맛집",
            "제로음료 추천"
        ).stream()
        .filter(s -> s.contains(query))
        .limit(5)
        .toList();

        return ResponseEntity.ok(suggestions);
    }

    // 7. 실시간 통계 요약 (대시보드용)
    @GetMapping("/stats/summary")
    public ResponseEntity<Map<String, Object>> getStatsSummary() {

        // TODO: 실제 DB에서 통계 데이터 조회
        Map<String, Object> stats = Map.of(
            "totalKeywords", 1247,
            "totalMentions", 15680,
            "activeUsers", 3421,
            "trendingCount", 23,
            "lastUpdated", new Date(),
            "updateInterval", "5분마다 업데이트"
        );

        return ResponseEntity.ok(stats);
    }

    /**
     * 랜덤 키워드 조회 (심층분석 페이지용)
     * @return 랜덤 키워드 상세 정보
     */
    @GetMapping("/random-keyword")
    public ResponseEntity<Map<String, Object>> getRandomKeyword() {
        try {
            System.out.println("🎲 랜덤 키워드 조회 API 호출");
            Map<String, Object> randomKeyword = mainService.getRandomKeyword();
            return ResponseEntity.ok(randomKeyword);
        } catch (Exception e) {
            System.err.println("❌ 랜덤 키워드 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "랜덤 키워드 조회에 실패했습니다."));
        }
    }
}
