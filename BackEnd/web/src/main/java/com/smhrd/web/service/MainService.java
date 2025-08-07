package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.smhrd.web.repository.MainMapper;
import com.smhrd.web.DTO.Top10DTO;
import java.util.*;

@Service
public class MainService {

    @Autowired
    private MainMapper mainMapper;

    @Autowired
    private OpenAIService openAIService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 키워드 랭킹 데이터 조회
     * @param period 조회 기간 (1일, 1주, 1달, 1년)
     * @return 랭킹 데이터와 메타 정보
     */
    public Map<String, Object> getRanking(String period) {
        System.out.println("🚀 랭킹 조회 시작 - 기간: " + period);

        // 6개월, 1년은 실제 DB 데이터 사용 (메인 랭킹 프로시저)
        try {
            // System.out.println("🔍 메인 랭킹 프로시저 호출 - 기간: " + period);
            // System.out.println("📋 프로시저 호출 시작 - 기간: " + period);

            // 프로시저 파라미터 준비 (IN/OUT 모두 포함)
            Map<String, Object> params = new HashMap<>();
            params.put("period", period);

            // 메인 랭킹 전용 프로시저 호출
            mainMapper.selectRankingByPeriod(params);
            // System.out.println("📋 result 객체: " + params.get("result"));

            // OUT 파라미터에서 결과 추출 (DTO 리스트로 받음)
            Object resultObj = params.get("result");
            List<Map<String, Object>> rankingData = new ArrayList<>();

            if (resultObj == null) {
                System.out.println("⚠️ result가 null입니다. params 전체: " + params);
            } else if (resultObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> resultList = (List<Object>) resultObj;

                // System.out.println("📋 result 타입: " + resultObj.getClass().getName());
                // System.out.println("📋 첫 번째 요소 타입: " +
                //     (resultList.isEmpty() ? "empty" : resultList.get(0).getClass().getName()));

                // DTO를 Map으로 변환
                for (Object item : resultList) {
                    if (item instanceof Top10DTO) {
                        Top10DTO dto = (Top10DTO) item;
                        rankingData.add(dto.toMap());
                    } else {
                        System.out.println("⚠️ 예상하지 못한 타입: " + item.getClass().getName());
                    }
                }
            } else {
                System.out.println("⚠️ result가 List가 아닙니다: " + resultObj.getClass().getName());
            }

            // System.out.println("📋 최종 결과: " + rankingData.size() + "개");

            // null 체크
            if (rankingData == null || rankingData.isEmpty()) {
                System.out.println("⚠️ 프로시저 결과가 비어있습니다. 더미 데이터 사용");
                return getDummyRankingData(period);
            }

            System.out.println("📊 DB 조회 결과: " + rankingData.size() + "개 데이터");
            if (!rankingData.isEmpty()) {
                Map<String, Object> firstData = rankingData.get(0);
                System.out.println("📋 첫 번째 데이터: " + firstData);
                System.out.println("📋 count 필드 타입: " +
                    (firstData.get("count") != null ? firstData.get("count").getClass().getSimpleName() : "null"));
                System.out.println("📋 count 값: " + firstData.get("count"));
            }

            // 3. 데이터가 없으면 더미 데이터 사용
            if (rankingData.isEmpty()) {
                System.out.println("⚠️ DB에서 데이터를 찾을 수 없어 더미 데이터 사용");
                return getDummyRankingData(period);
            }

            // 4. 최대 카운트 계산 (Oracle 타입 안전 처리)
            int maxCount = rankingData.stream()
                    .mapToInt(data -> {
                        Object countObj = data.get("count");
                        if (countObj == null) return 0;
                        if (countObj instanceof Number) {
                            return ((Number) countObj).intValue();
                        }
                        try {
                            return Integer.parseInt(countObj.toString());
                        } catch (NumberFormatException e) {
                            System.err.println("⚠️ count 값 변환 실패: " + countObj);
                            return 0;
                        }
                    })
                    .max()
                    .orElse(0);

            // 5. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("period", period);
            response.put("data", rankingData);
            response.put("maxCount", maxCount);
            response.put("lastUpdated", new Date());
            response.put("totalCount", rankingData.size());
            response.put("dataSource", "database"); // 실제 DB 데이터임을 표시

            System.out.println("✅ 실제 DB 데이터 응답 완료: " + rankingData.size() + "개");
            return response;

        } catch (Exception e) {
            // 에러 발생 시 더미 데이터 반환
            // System.err.println("랭킹 데이터 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return getDummyRankingData(period);
        }
    }

    /**
     * 에러 시 사용할 더미 랭킹 데이터
     */
    private Map<String, Object> getDummyRankingData(String period) {
        System.out.println("📝 더미 데이터 생성 - 기간: " + period);

        // 기간별로 다른 더미 데이터 생성
        List<Map<String, Object>> dummyData;
        int maxCount;

        if ("1년".equals(period)) {
            // 1년 데이터 - 더 높은 수치
            dummyData = Arrays.asList(
                createRankingItem(1, "탕후루", "⬆", "#e60000", 15420),
                createRankingItem(2, "마라탕", "↔", "#000000", 12980),
                createRankingItem(3, "제로음료", "⬇", "#0044ff", 11203),
                createRankingItem(4, "포케", "↔", "#000000", 9892),
                createRankingItem(5, "인절미 토스트", "↔", "#000000", 8810),
                createRankingItem(6, "트러플 감자튀김", "⬆", "#e60000", 7759),
                createRankingItem(7, "뿌링클 치킨", "↔", "#000000", 6739),
                createRankingItem(8, "아이스크림+식빵조합", "⬆", "#e60000", 5689),
                createRankingItem(9, "로제 떡볶이", "⬇", "#0044ff", 4599),
                createRankingItem(10, "샌이머스켓 디저트", "⬆", "#e60000", 3201)
            );
            maxCount = 15420;
        } else {
            // 6개월 데이터 - 중간 수치
            dummyData = Arrays.asList(
                createRankingItem(1, "탕후루", "⬆", "#e60000", 8420),
                createRankingItem(2, "마라탕", "↔", "#000000", 7280),
                createRankingItem(3, "제로음료", "⬇", "#0044ff", 6503),
                createRankingItem(4, "포케", "↔", "#000000", 5892),
                createRankingItem(5, "인절미 토스트", "↔", "#000000", 5210),
                createRankingItem(6, "트러플 감자튀김", "⬆", "#e60000", 4759),
                createRankingItem(7, "뿌링클 치킨", "↔", "#000000", 4239),
                createRankingItem(8, "아이스크림+식빵조합", "⬆", "#e60000", 3689),
                createRankingItem(9, "로제 떡볶이", "⬇", "#0044ff", 2999),
                createRankingItem(10, "샌이머스켓 디저트", "⬆", "#e60000", 2201)
            );
            maxCount = 8420;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("period", period);
        response.put("data", dummyData);
        response.put("maxCount", maxCount);
        response.put("lastUpdated", new Date());
        response.put("totalCount", 10);
        response.put("dataSource", "dummy"); // 더미 데이터임을 표시
        response.put("isDummy", true);

        return response;
    }

    /**
     * TOP3 키워드의 인사이트 데이터 조회
     * @param period 조회 기간 ("일", "주", "월")
     * @return TOP3 인사이트 차트 데이터
     */
    public Map<String, Object> getTop3Insights(String period) {
        try {
            System.out.println("📊 TOP3 인사이트 데이터 조회 시작");

            // 먼저 TOP3 키워드 목록 가져오기
            Map<String, Object> top3Response = getTop3Keywords();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> top3Data = (List<Map<String, Object>>) top3Response.get("data");

            if (top3Data.isEmpty()) {
                System.out.println("⚠️ TOP3 데이터가 없어 더미 인사이트 데이터 사용");
                return getDummyTop3Insights();
            }

            // 기간별 데이터 생성
            List<Map<String, Object>> chartData = new ArrayList<>();

            switch (period) {
                case "일":
                    // 최근 한 달간 일별 데이터 (30일)
                    chartData = generateDailyData(top3Data);
                    break;
                case "주":
                    // 최근 3개월간 주별 데이터 (12주)
                    chartData = generateWeeklyData(top3Data);
                    break;
                case "월":
                default:
                    // 최근 6개월간 월별 데이터 (6개월)
                    chartData = generateMonthlyData(top3Data);
                    break;
            }

            // TOP3 키워드 이름 목록
            List<String> keywordNames = top3Data.stream()
                .map(item -> (String) item.get("keyword"))
                .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("chartData", chartData);
            response.put("keywords", keywordNames);
            response.put("period", "6개월");
            response.put("lastUpdated", new Date());

            System.out.println("✅ TOP3 인사이트 데이터 조회 완료: " + chartData.size() + "개월");
            return response;

        } catch (Exception e) {
            System.err.println("❌ TOP3 인사이트 데이터 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return getDummyTop3Insights();
        }
    }

    /**
     * 특정 키워드의 월별 언급량 조회
     * @param keyword 키워드명
     * @param month 월 (YYYY-MM 형식)
     * @return 해당 월 언급량
     */
    private int getMonthlyKeywordCount(String keyword, String month) {
        try {
            // 월의 시작일과 종료일 계산
            String startDate = month + "-01";
            String endDate = month + "-31"; // 간단히 31일로 설정 (DB에서 자동 처리)

            // 프로시저 대신 간단한 쿼리로 월별 데이터 조회
            // 실제로는 별도 매퍼 메서드가 필요하지만, 여기서는 추정값 사용

            // 키워드별 월별 추정 데이터 (실제 구현 시 DB 쿼리로 대체)
            Map<String, Map<String, Integer>> estimatedData = getEstimatedMonthlyData();

            return estimatedData.getOrDefault(keyword, new HashMap<>())
                .getOrDefault(month, 0);

        } catch (Exception e) {
            System.err.println("❌ 월별 키워드 조회 실패: " + keyword + ", " + month);
            return 0;
        }
    }

    /**
     * 추정 월별 데이터 (실제 구현 시 DB 쿼리로 대체)
     */
    private Map<String, Map<String, Integer>> getEstimatedMonthlyData() {
        Map<String, Map<String, Integer>> data = new HashMap<>();

        // 먹방 데이터
        Map<String, Integer> mukbangData = new HashMap<>();
        mukbangData.put("2025-02", 35);
        mukbangData.put("2025-03", 42);
        mukbangData.put("2025-04", 48);
        mukbangData.put("2025-05", 55);
        mukbangData.put("2025-06", 62);
        mukbangData.put("2025-07", 78);
        data.put("먹방", mukbangData);

        // 간식 데이터
        Map<String, Integer> snackData = new HashMap<>();
        snackData.put("2025-02", 12);
        snackData.put("2025-03", 15);
        snackData.put("2025-04", 18);
        snackData.put("2025-05", 22);
        snackData.put("2025-06", 28);
        snackData.put("2025-07", 35);
        data.put("간식", snackData);

        // 딸기 데이터
        Map<String, Integer> strawberryData = new HashMap<>();
        strawberryData.put("2025-02", 8);
        strawberryData.put("2025-03", 25);
        strawberryData.put("2025-04", 32);
        strawberryData.put("2025-05", 28);
        strawberryData.put("2025-06", 15);
        strawberryData.put("2025-07", 12);
        data.put("딸기", strawberryData);

        return data;
    }

    /**
     * 일별 데이터 생성 (최근 30일)
     */
    private List<Map<String, Object>> generateDailyData(List<Map<String, Object>> top3Data) {
        List<Map<String, Object>> dailyData = new ArrayList<>();

        // 최근 30일 데이터 생성
        for (int i = 29; i >= 0; i--) {
            Map<String, Object> dayData = new HashMap<>();
            String day = String.format("07/%02d", 31 - i); // 07/02 ~ 07/31 형식
            dayData.put("period", day);

            // 각 키워드별 일별 추정 데이터
            for (Map<String, Object> keyword : top3Data) {
                String keywordName = (String) keyword.get("keyword");
                int dailyCount = getDailyEstimatedCount(keywordName, i);
                dayData.put(keywordName, dailyCount);
            }

            dailyData.add(dayData);
        }

        return dailyData;
    }

    /**
     * 주별 데이터 생성 (최근 12주)
     */
    private List<Map<String, Object>> generateWeeklyData(List<Map<String, Object>> top3Data) {
        List<Map<String, Object>> weeklyData = new ArrayList<>();

        // 최근 12주 데이터 생성
        String[] weeks = {"5월1주", "5월2주", "5월3주", "5월4주",
                         "6월1주", "6월2주", "6월3주", "6월4주",
                         "7월1주", "7월2주", "7월3주", "7월4주"};

        for (int i = 0; i < weeks.length; i++) {
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("period", weeks[i]);

            // 각 키워드별 주별 추정 데이터
            for (Map<String, Object> keyword : top3Data) {
                String keywordName = (String) keyword.get("keyword");
                int weeklyCount = getWeeklyEstimatedCount(keywordName, i);
                weekData.put(keywordName, weeklyCount);
            }

            weeklyData.add(weekData);
        }

        return weeklyData;
    }

    /**
     * 월별 데이터 생성 (최근 6개월)
     */
    private List<Map<String, Object>> generateMonthlyData(List<Map<String, Object>> top3Data) {
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        String[] months = {"02월", "03월", "04월", "05월", "06월", "07월"};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("period", months[i]);

            // 각 키워드별 월별 추정 데이터
            for (Map<String, Object> keyword : top3Data) {
                String keywordName = (String) keyword.get("keyword");
                int monthlyCount = getMonthlyEstimatedCount(keywordName, i);
                monthData.put(keywordName, monthlyCount);
            }

            monthlyData.add(monthData);
        }

        return monthlyData;
    }

    /**
     * 일별 추정 데이터
     */
    private int getDailyEstimatedCount(String keyword, int dayIndex) {
        Map<String, int[]> dailyPatterns = Map.of(
            "먹방", new int[]{2, 3, 4, 3, 5, 6, 7, 4, 3, 5, 6, 8, 9, 7, 6, 8, 9, 10, 8, 7, 9, 10, 12, 11, 9, 10, 11, 13, 12, 14},
            "간식", new int[]{1, 1, 2, 1, 2, 2, 3, 2, 1, 2, 3, 3, 4, 3, 2, 3, 4, 4, 3, 3, 4, 4, 5, 4, 4, 4, 5, 5, 5, 6},
            "딸기", new int[]{1, 0, 1, 1, 1, 2, 1, 1, 0, 1, 1, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 3, 2, 2, 2, 3, 3, 2, 3}
        );

        int[] pattern = dailyPatterns.getOrDefault(keyword, new int[30]);
        return dayIndex < pattern.length ? pattern[dayIndex] : 1;
    }

    /**
     * 주별 추정 데이터
     */
    private int getWeeklyEstimatedCount(String keyword, int weekIndex) {
        Map<String, int[]> weeklyPatterns = Map.of(
            "먹방", new int[]{15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52},
            "간식", new int[]{8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30},
            "딸기", new int[]{12, 15, 18, 20, 18, 15, 12, 10, 8, 6, 5, 4}
        );

        int[] pattern = weeklyPatterns.getOrDefault(keyword, new int[12]);
        return weekIndex < pattern.length ? pattern[weekIndex] : 5;
    }

    /**
     * 월별 추정 데이터
     */
    private int getMonthlyEstimatedCount(String keyword, int monthIndex) {
        Map<String, int[]> monthlyPatterns = Map.of(
            "먹방", new int[]{35, 42, 48, 55, 62, 78},
            "간식", new int[]{12, 15, 18, 22, 28, 35},
            "딸기", new int[]{8, 25, 32, 28, 15, 12}
        );

        int[] pattern = monthlyPatterns.getOrDefault(keyword, new int[6]);
        return monthIndex < pattern.length ? pattern[monthIndex] : 10;
    }

    /**
     * 더미 TOP3 인사이트 데이터
     */
    private Map<String, Object> getDummyTop3Insights() {
        List<Map<String, Object>> dummyChartData = Arrays.asList(
            Map.of("period", "02월", "먹방", 35, "간식", 12, "딸기", 8),
            Map.of("period", "03월", "먹방", 42, "간식", 15, "딸기", 25),
            Map.of("period", "04월", "먹방", 48, "간식", 18, "딸기", 32),
            Map.of("period", "05월", "먹방", 55, "간식", 22, "딸기", 28),
            Map.of("period", "06월", "먹방", 62, "간식", 28, "딸기", 15),
            Map.of("period", "07월", "먹방", 78, "간식", 35, "딸기", 12)
        );

        return Map.of(
            "chartData", dummyChartData,
            "keywords", Arrays.asList("먹방", "간식", "딸기"),
            "period", "월",
            "lastUpdated", new Date()
        );
    }

    /**
     * TOP3 키워드 조회
     * @return TOP3 키워드 데이터
     */
    public Map<String, Object> getTop3Keywords() {
        try {
            System.out.println("🔍 TOP3 키워드 조회 시작");

            // 프로시저 파라미터 준비 (6개월 기준으로 TOP3 조회)
            Map<String, Object> params = new HashMap<>();
            params.put("period", "6개월");

            // 메인 랭킹 프로시저 호출
            mainMapper.selectRankingByPeriod(params);

            // OUT 파라미터에서 결과 추출
            Object resultObj = params.get("result");
            List<Map<String, Object>> top3Data = new ArrayList<>();

            if (resultObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> resultList = (List<Object>) resultObj;

                // TOP3만 추출하고 DTO를 Map으로 변환
                for (int i = 0; i < Math.min(3, resultList.size()); i++) {
                    Object item = resultList.get(i);
                    if (item instanceof Top10DTO) {
                        Top10DTO dto = (Top10DTO) item;
                        Map<String, Object> top3Item = new HashMap<>();
                        top3Item.put("rank", dto.getRank());
                        top3Item.put("keyword", dto.getName());
                        top3Item.put("count", dto.getCount());
                        top3Item.put("trend", dto.getTrend());
                        top3Item.put("color", dto.getColor());
                        top3Item.put("description", openAIService.generateZalpaDescription(dto.getName())); // OpenAI로 설명 생성

                        top3Data.add(top3Item);
                    }
                }
            }

            // TOP3 데이터가 없으면 더미 데이터 사용
            if (top3Data.isEmpty()) {
                System.out.println("⚠️ TOP3 데이터가 없어 더미 데이터 사용");
                top3Data = Arrays.asList(
                    Map.of("rank", 1, "keyword", "탕후루", "count", 1020, "trend", "⬆", "color", "#e60000", "description", "달콤한 중국 전통 간식"),
                    Map.of("rank", 2, "keyword", "마라탕", "count", 980, "trend", "↔", "color", "#ff6600", "description", "얼얼한 중국식 훠궈"),
                    Map.of("rank", 3, "keyword", "제로음료", "count", 903, "trend", "⬇", "color", "#ff6600", "description", "칼로리 제로 음료")
                );
            }

            // 총 언급수 계산
            int totalMentions = top3Data.stream()
                .mapToInt(item -> (Integer) item.get("count"))
                .sum();

            Map<String, Object> response = new HashMap<>();
            response.put("data", top3Data);
            response.put("totalMentions", totalMentions);
            response.put("lastUpdated", new Date());

            System.out.println("✅ TOP3 키워드 조회 완료: " + top3Data.size() + "개");
            return response;

        } catch (Exception e) {
            System.err.println("❌ TOP3 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 더미 데이터 반환
            List<Map<String, Object>> dummyData = Arrays.asList(
                Map.of("rank", 1, "keyword", "탕후루", "count", 1020, "trend", "⬆", "color", "#e60000", "description", "달콤한 중국 전통 간식"),
                Map.of("rank", 2, "keyword", "마라탕", "count", 980, "trend", "↔", "color", "#ff6600", "description", "얼얼한 중국식 훠궈"),
                Map.of("rank", 3, "keyword", "제로음료", "count", 903, "trend", "⬇", "color", "#ff6600", "description", "칼로리 제로 음료")
            );

            return Map.of(
                "data", dummyData,
                "totalMentions", 2903,
                "lastUpdated", new Date()
            );
        }
    }



    /**
     * TOP3 인사이트 AI 요약 생성
     * @param keywords TOP3 키워드 목록
     * @param period 조회 기간
     * @return OpenAI 생성 요약문
     */
    public String generateTop3InsightSummary(List<String> keywords, String period) {
        try {
            System.out.println("🤖 TOP3 인사이트 AI 요약 생성 시작");
            System.out.println("📋 입력 키워드: " + keywords);
            System.out.println("📋 분석 기간: " + period);

            // 키워드 목록을 문자열로 변환
            String keywordList = String.join(", ", keywords);
            System.out.println("📋 키워드 문자열: " + keywordList);

            // OpenAI 프롬프트 생성
            String prompt = String.format(
                "다음은 최근 %s별 음식 트렌드 TOP3 키워드입니다: %s\n\n" +
                "이 키워드들의 트렌드 변화와 인사이트를 분석하여 2-3문장으로 요약해주세요. " +
                "각 키워드의 특징과 전체적인 트렌드 방향성을 포함해주세요. " +
                "전문적이면서도 이해하기 쉬운 톤으로 작성해주세요.",
                period, keywordList
            );
            System.out.println("📋 생성된 프롬프트: " + prompt);

            // OpenAI API 호출
            String aiSummary = openAIService.generateInsight(prompt);
            System.out.println("📋 생성된 AI 요약: " + aiSummary);

            System.out.println("✅ AI 요약 생성 완료");
            return aiSummary;

        } catch (Exception e) {
            System.err.println("❌ AI 요약 생성 실패: " + e.getMessage());
            e.printStackTrace();

            // 실패 시 기본 요약문 반환
            String keywordList = String.join(", ", keywords);
            String fallbackSummary = String.format(
                "%s 키워드가 최근 %s별 트렌드에서 주목받고 있습니다. " +
                "이들 키워드는 각각 독특한 성장 패턴을 보이며, 전체적으로 다양한 음식 문화의 확산과 " +
                "소비자 취향의 변화를 반영하고 있습니다.",
                keywordList, period
            );
            System.out.println("📋 기본 요약문 사용: " + fallbackSummary);
            return fallbackSummary;
        }
    }

    /**
     * 급상승 키워드 TOP3 조회 (최근 30일 기준)
     * @return 급상승 키워드 데이터
     */
    public Map<String, Object> getTrendingKeywords() {
        try {
            System.out.println("📈 급상승 키워드 TOP3 조회 시작");

            // 단계별 조회: 30일 → 60일 → 90일 → 최근 데이터
            List<Map<String, Object>> results = null;
            String usedPeriod = "";

            // 1단계: 2025년 7월 (2025-07-01 ~ 2025-07-31) 조회
            results = mainMapper.getTrendingKeywordsRecent30Days();
            System.out.println("📊 2025년 7월 DB 조회 결과: " + results.size() + "개 키워드");

            if (results.size() >= 3) {
                usedPeriod = "2025년 7월";
            } else {
                // 2단계: 2025년 6-7월 (2025-06-01 ~ 2025-07-31) 조회
                System.out.println("⚠️ 7월 데이터 부족 (" + results.size() + "개). 6-7월로 확장 조회");
                results = mainMapper.getTrendingKeywordsRecent60Days();
                System.out.println("📊 2025년 6-7월 DB 조회 결과: " + results.size() + "개 키워드");

                if (results.size() >= 3) {
                    usedPeriod = "2025년 6-7월";
                } else {
                    // 3단계: 2025년 5-7월 (2025-05-01 ~ 2025-07-31) 조회
                    System.out.println("⚠️ 6-7월 데이터 부족 (" + results.size() + "개). 5-7월로 확장 조회");
                    results = mainMapper.getTrendingKeywordsRecent90Days();
                    System.out.println("📊 2025년 5-7월 DB 조회 결과: " + results.size() + "개 키워드");

                    if (results.size() >= 3) {
                        usedPeriod = "2025년 5-7월";
                    } else {
                        // 4단계: 2025년 7월 마지막 주 (2025-07-25 ~ 2025-07-31)에서 랜덤 3개
                        System.out.println("⚠️ 5-7월 데이터도 부족 (" + results.size() + "개). 7월 마지막 주에서 랜덤 선택");
                        results = mainMapper.getTrendingKeywordsLatest();
                        System.out.println("📊 2025년 7월 마지막 주 랜덤 조회 결과: " + results.size() + "개 키워드");
                        usedPeriod = "2025년 7월 마지막 주 (랜덤)";
                    }
                }
            }

            List<Map<String, Object>> trendingKeywords = new ArrayList<>();

            // 결과를 응답 형식으로 변환
            System.out.println("🔍 급상승 키워드 TOP3 분석 결과:");
            System.out.println("📋 DB 응답 데이터 샘플: " + (results.isEmpty() ? "없음" : results.get(0)));

            for (int i = 0; i < results.size() && i < 3; i++) {
                Map<String, Object> row = results.get(i);
                System.out.println("📋 Row " + i + " 데이터: " + row);
                System.out.println("📋 Row " + i + " 키들: " + row.keySet());

                // Oracle은 대문자로 컬럼명을 반환할 수 있으므로 여러 케이스 확인
                String keywordName = getStringValue(row, "keyword_name", "KEYWORD_NAME");
                Long totalCount = getLongValue(row, "total_count", "TOTAL_COUNT");
                Long mentionDays = getLongValue(row, "mention_days", "MENTION_DAYS");

                // 성장률 계산 (임시로 랜덤 생성, 실제로는 이전 기간과 비교)
                String growth = "+" + (20 + (int)(Math.random() * 30)) + "%";

                // 설명 생성
                String description = generateKeywordDescription(keywordName, totalCount, mentionDays);

                Map<String, Object> keywordData = new HashMap<>();
                keywordData.put("keyword", keywordName);
                keywordData.put("count", totalCount);
                keywordData.put("growth", growth);
                keywordData.put("rank", i + 1);
                keywordData.put("description", description);
                keywordData.put("mentionDays", mentionDays);

                trendingKeywords.add(keywordData);

                // 상세 디버그 로그
                System.out.println("🏆 " + (i+1) + "위: '" + keywordName + "'");
                System.out.println("   📊 총 언급량: " + totalCount + "회");
                System.out.println("   📅 언급 일수: " + mentionDays + "일");
                System.out.println("   📈 성장률: " + growth);
                System.out.println("   💬 설명: " + description);
                System.out.println("   ─────────────────────────────");
            }

            // 3개가 안 되면 기본 키워드로 채우기
            while (trendingKeywords.size() < 3) {
                String[] defaultKeywords = {"먹방", "간식", "딸기", "레시피", "요리", "과일"};
                String defaultKeyword = defaultKeywords[trendingKeywords.size()];

                Map<String, Object> defaultData = new HashMap<>();
                defaultData.put("keyword", defaultKeyword);
                defaultData.put("count", 100 + (int)(Math.random() * 500));
                defaultData.put("growth", "+" + (10 + (int)(Math.random() * 20)) + "%");
                defaultData.put("rank", trendingKeywords.size() + 1);
                defaultData.put("description", defaultKeyword + "가 꾸준한 관심을 받고 있습니다.");
                defaultData.put("mentionDays", 15L);

                trendingKeywords.add(defaultData);
                System.out.println("📊 기본 키워드 추가: " + defaultKeyword);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("trendingKeywords", trendingKeywords);
            response.put("period", usedPeriod);
            response.put("lastUpdated", new Date());
            response.put("totalKeywords", trendingKeywords.size());
            response.put("searchStrategy", "단계별 조회 (30일→60일→90일→최근)");

            System.out.println("✅ 급상승 키워드 TOP3 조회 완료");
            return response;

        } catch (Exception e) {
            System.err.println("❌ 급상승 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();

            // 에러 시 기본 데이터 반환
            List<Map<String, Object>> fallbackKeywords = Arrays.asList(
                Map.of("keyword", "먹방", "count", 1250, "growth", "+45%", "rank", 1,
                       "description", "유튜브와 인스타그램에서 폭발적 증가"),
                Map.of("keyword", "간식", "count", 980, "growth", "+32%", "rank", 2,
                       "description", "건강한 간식 트렌드로 주목받는 중"),
                Map.of("keyword", "딸기", "count", 756, "growth", "+28%", "rank", 3,
                       "description", "계절 과일로 디저트 메뉴에서 인기")
            );

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("trendingKeywords", fallbackKeywords);
            errorResponse.put("period", "기본 데이터 (에러 시)");
            errorResponse.put("lastUpdated", new Date());
            errorResponse.put("totalKeywords", 3);
            errorResponse.put("searchStrategy", "에러 발생으로 기본 데이터 사용");

            return errorResponse;
        }
    }

    /**
     * 키워드 설명 생성 헬퍼 메서드
     */
    private String generateKeywordDescription(String keyword, Long totalCount, Long mentionDays) {
        String[] templates = {
            "%s가 최근 %d일간 총 %d회 언급되며 높은 관심을 받고 있습니다.",
            "%s 키워드가 %d일 동안 %d회 언급되어 트렌드를 이끌고 있습니다.",
            "최근 %d일간 %s가 %d회 언급되며 급상승 중입니다.",
            "%s가 %d일에 걸쳐 %d회 언급되어 주목받고 있습니다."
        };

        String template = templates[(int)(Math.random() * templates.length)];
        return String.format(template, keyword, mentionDays, totalCount);
    }

    /**
     * Map에서 String 값을 안전하게 가져오는 헬퍼 메서드
     */
    private String getStringValue(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return "알 수 없음";
    }

    /**
     * Map에서 Long 값을 안전하게 가져오는 헬퍼 메서드
     */
    private Long getLongValue(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null && value instanceof Number) {
                return ((Number) value).longValue();
            }
        }
        return 0L;
    }

    /**
     * 랭킹 아이템 생성 헬퍼 메서드
     */
    private Map<String, Object> createRankingItem(int rank, String name, String trend, String color, int count) {
        Map<String, Object> item = new HashMap<>();
        item.put("rank", rank);
        item.put("name", name);
        item.put("trend", trend);
        item.put("color", color);
        item.put("count", count);
        return item;
    }


}
