package com.smhrd.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
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

    // 3. 급상승 키워드 (Main_Trending 컴포넌트용)
    @GetMapping("/trending")
    public ResponseEntity<Map<String, Object>> getTrendingKeywords() {

        // TODO: 실제 DB에서 데이터 조회
        List<Map<String, Object>> trendingData = Arrays.asList(
            Map.of("keyword", "트러플 감자튀김", "growthRate", 45.2, "currentCount", 759, "previousCount", 523),
            Map.of("keyword", "아이스크림+식빵조합", "growthRate", 38.7, "currentCount", 689, "previousCount", 497),
            Map.of("keyword", "샌이머스켓 디저트", "growthRate", 67.8, "currentCount", 201, "previousCount", 120),
            Map.of("keyword", "비건 디저트", "growthRate", 29.3, "currentCount", 156, "previousCount", 121),
            Map.of("keyword", "홈카페 원두", "growthRate", 22.1, "currentCount", 134, "previousCount", 110)
        );

        Map<String, Object> response = Map.of(
            "data", trendingData,
            "averageGrowth", 40.6,
            "lastUpdated", new Date()
        );

        return ResponseEntity.ok(response);
    }

    // 4. TOP3 인사이트 차트 데이터 (Main_top3_insight 컴포넌트용)
    @GetMapping("/top3/insights")
    public ResponseEntity<Map<String, Object>> getTop3Insights(
            @RequestParam(defaultValue = "월") String period) {
        System.out.println("📊 TOP3 인사이트 API 호출됨 - 기간: " + period);

        try {
            Map<String, Object> response = mainService.getTop3Insights(period);
            System.out.println("✅ TOP3 인사이트 응답 성공");
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
                "lastUpdated", new Date()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    // 5. 급상승 인사이트 차트 데이터 (Main_Trending_insight 컴포넌트용)
    @GetMapping("/trending/insights")
    public ResponseEntity<Map<String, Object>> getTrendingInsights() {

        // TODO: 실제 DB에서 급상승 차트 데이터 조회
        Map<String, Object> chartData = Map.of(
            "labels", Arrays.asList("1주전", "6일전", "5일전", "4일전", "3일전", "2일전", "1일전", "오늘"),
            "datasets", Arrays.asList(
                Map.of("label", "트러플 감자튀김", "data", Arrays.asList(400, 450, 500, 580, 650, 700, 730, 759), "color", "#FF9F43"),
                Map.of("label", "아이스크림+식빵조합", "data", Arrays.asList(350, 380, 420, 480, 550, 620, 660, 689), "color", "#6C5CE7"),
                Map.of("label", "샌이머스켓 디저트", "data", Arrays.asList(80, 90, 110, 130, 150, 170, 185, 201), "color", "#A29BFE")
            ),
            "growthAnalysis", Map.of(
                "fastestGrowing", "샌이머스켓 디저트",
                "steadyGrowing", "트러플 감자튀김",
                "totalGrowthRate", 45.2
            )
        );

        return ResponseEntity.ok(chartData);
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
}
