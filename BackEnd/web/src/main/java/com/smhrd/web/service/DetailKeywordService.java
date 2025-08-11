package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smhrd.web.repository.DetailKeywordMapper;
import java.util.*;

@Service
public class DetailKeywordService {

    @Autowired
    private DetailKeywordMapper detailKeywordMapper;
    

    /**
     * 키워드 상세 정보 조회
     * @param keywordName 검색할 키워드명
     * @return 키워드 상세 정보
     */
    public Map<String, Object> getKeywordDetails(String keywordName) {
        try {
            System.out.println("=================================================");
            System.out.println("🔍 키워드 상세 정보 조회 시작: " + keywordName);
            System.out.println("=================================================");

            

            // 디버그: 모든 키워드 조회해서 확인
            List<Map<String, Object>> allKeywords = detailKeywordMapper.getAllKeywords();
            System.out.println("📊 DB에 있는 총 키워드 수: " + allKeywords.size());

            // 젤리가 포함된 키워드들 찾기
            allKeywords.stream()
                .filter(k -> k.get("KEYWORD_NAME").toString().contains("젤리"))
                .forEach(k -> System.out.println("🔍 젤리 관련 키워드: " + k.get("KEYWORD_NAME")));

            // 1. 키워드 기본 정보 조회
            Map<String, Object> keywordInfo = detailKeywordMapper.getKeywordByName(keywordName);

            if (keywordInfo == null) {
                System.out.println("⚠️ 키워드를 찾을 수 없음: " + keywordName);
                System.out.println("📋 검색한 키워드: '" + keywordName + "' (길이: " + keywordName.length() + ")");

                // 비슷한 키워드 찾기 (최대 3개)
                List<String> similarKeywords = allKeywords.stream()
                    .filter(k -> k.get("KEYWORD_NAME").toString().toLowerCase().contains(keywordName.toLowerCase()))
                    .limit(3)
                    .map(k -> k.get("KEYWORD_NAME").toString())
                    .collect(java.util.stream.Collectors.toList());

                // 비슷한 키워드가 없으면 인기 키워드 3개 추천
                if (similarKeywords.isEmpty()) {
                    similarKeywords = allKeywords.stream()
                        .filter(k -> k.get("total_mentions") != null)
                        .sorted((a, b) -> {
                            Long countA = a.get("total_mentions") != null ?
                                ((Number) a.get("total_mentions")).longValue() : 0L;
                            Long countB = b.get("total_mentions") != null ?
                                ((Number) b.get("total_mentions")).longValue() : 0L;
                            return countB.compareTo(countA);
                        })
                        .limit(3)
                        .map(k -> k.get("KEYWORD_NAME").toString())
                        .collect(java.util.stream.Collectors.toList());
                }

                System.out.println("🔍 추천 키워드: " + similarKeywords);

                Map<String, Object> response = new HashMap<>();
                response.put("keywordInfo", null);
                response.put("similarKeywords", similarKeywords);
                response.put("message", "검색한 키워드를 찾을 수 없습니다.");

                return response;
            }
            
            Long keywordId = ((Number) keywordInfo.get("KEYWORD_ID")).longValue();
            System.out.println("📊 키워드 ID: " + keywordId);
            
            // 2. 키워드 메인 통계 조회
            List<Map<String, Object>> mainStats = detailKeywordMapper.getKeywordMainStats(keywordId);
            System.out.println("📊 메인 통계 데이터: " + mainStats.size() + "개");

            // CLOB 데이터 처리 (안전장치)
            mainStats = processClobData(mainStats);
            
            // 3. 키워드 유사도 정보 조회
            Map<String, Object> similarityInfo = null;
            List<Map<String, Object>> similarKeywordDetails = new ArrayList<>();

            try {
                similarityInfo = detailKeywordMapper.getKeywordSimilarity(keywordId);
                System.out.println("📊 유사도 정보: " + (similarityInfo != null ? "있음" : "없음"));

                // 유사 키워드 ID들을 수집하고 상세 정보 조회
                if (similarityInfo != null) {
                    // 순서를 유지하면서 중복 제거를 위한 LinkedHashSet 사용
                    Set<Long> uniqueKeywordIds = new LinkedHashSet<>();
                    List<Map<String, Object>> orderedSimilarKeywords = new ArrayList<>();

                    // SIMILAR_1_ID ~ SIMILAR_5_ID 순서대로 처리
                    for (int i = 1; i <= 5; i++) {
                        Object similarId = similarityInfo.get("SIMILAR_" + i + "_ID");
                        if (similarId != null && !similarId.equals(0)) {
                            Long similarKeywordId = ((Number) similarId).longValue();

                            // 중복되지 않은 키워드만 처리
                            if (!uniqueKeywordIds.contains(similarKeywordId)) {
                                uniqueKeywordIds.add(similarKeywordId);

                                // 개별 키워드 정보 조회
                                try {
                                    Map<String, Object> keywordDetail = detailKeywordMapper.getKeywordById(similarKeywordId);
                                    if (keywordDetail != null) {
                                        orderedSimilarKeywords.add(keywordDetail);
                                    }
                                } catch (Exception e) {
                                    System.out.println("⚠️ 키워드 ID " + similarKeywordId + " 조회 실패: " + e.getMessage());
                                }
                            }
                        }
                    }

                    similarKeywordDetails = orderedSimilarKeywords;
                    System.out.println("📊 유사 키워드 상세 정보: " + similarKeywordDetails.size() + "개 (중복 제거 후)");
                }

            } catch (Exception e) {
                System.out.println("⚠️ 유사도 정보 조회 실패: " + e.getMessage());
                // 유사도 정보가 없어도 계속 진행
            }

            // 4. 감성분석은 별도 API로 분리 (빠른 응답을 위해)
            System.out.println("⚡ 기본 정보만 조회 (감성분석은 별도 호출)");
            // 감성분석은 별도 API에서 처리

            // 5. 유사 키워드 목록 추출 (검색 제안용)
            List<String> suggestedKeywords = new ArrayList<>();
            if (similarKeywordDetails != null && !similarKeywordDetails.isEmpty()) {
                String currentKeyword = (String) keywordInfo.get("KEYWORD_NAME");

                for (Map<String, Object> similar : similarKeywordDetails) {
                    String similarKeywordName = (String) similar.get("KEYWORD_NAME");
                    if (similarKeywordName != null && !similarKeywordName.equals(currentKeyword)) {
                        suggestedKeywords.add(similarKeywordName);
                    }
                }

                if (!suggestedKeywords.isEmpty()) {
                    System.out.println("✅ " + currentKeyword + " 관련 DB 키워드 " + suggestedKeywords.size() + "개 발견");
                }
            }

            // 6. 응답 데이터 구성 (감성분석 제외)
            Map<String, Object> response = new HashMap<>();
            response.put("keywordInfo", keywordInfo);
            response.put("mainStats", mainStats);
            response.put("similarityInfo", similarityInfo);
            response.put("similarKeywords", similarKeywordDetails);
            response.put("suggestedKeywords", suggestedKeywords); // 검색 제안용 키워드 목록
            response.put("lastUpdated", new Date());
            
            // 🔽🔽🔽 여기서 전체 랭킹 값을 추가로 주입
            try {
                Map<String, Object> rankInfo = detailKeywordMapper.getKeywordOverallRank(keywordName);
                System.out.println("🏆 전체 랭킹 조회 시작: " + keywordName);
                System.out.println("🔍 rankInfo 결과: " + rankInfo);

                if (rankInfo != null && rankInfo.get("ranking") != null) {
                    int rankingValue = ((Number) rankInfo.get("ranking")).intValue();
                    response.put("ranking", rankingValue);
                    System.out.println("✅ 랭킹 설정 완료: " + rankingValue + "위");
                } else {
                    response.put("ranking", 999);
                    System.out.println("⚠️ 랭킹 정보 없음, 기본값 999 설정");
                }

            } catch (Exception e) {
                System.out.println("❌ 전체 랭킹 조회 실패: " + e.getMessage());
                e.printStackTrace();
                response.put("ranking", 999);
            }

            System.out.println("✅ 키워드 상세 정보 조회 완료: " + keywordName);
            System.out.println("📤 프론트엔드로 전달되는 ranking 값: " + response.get("ranking"));
            return response;

        } catch (Exception e) {
            System.err.println("❌ 키워드 상세 정보 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


    

    /**
     * 키워드 자동완성 검색
     * @param query 검색 쿼리
     * @return 자동완성 키워드 목록
     */
    public Map<String, Object> getAutocompleteKeywords(String query) {
        try {
            System.out.println("🔍 자동완성 검색 시작: " + query);
            
            // 키워드명에 쿼리가 포함된 키워드들 조회 (최대 10개)
            List<Map<String, Object>> keywords = detailKeywordMapper.getAutocompleteKeywords(query);
            System.out.println("📊 자동완성 결과: " + keywords.size() + "개");
            
            Map<String, Object> response = new HashMap<>();
            response.put("keywords", keywords);
            response.put("query", query);
            response.put("count", keywords.size());
            
            System.out.println("✅ 자동완성 검색 완료");
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ 자동완성 검색 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 인기 키워드 목록 조회 (검색 추천용)
     * @return 인기 키워드 목록
     */
    public Map<String, Object> getPopularKeywords() {
        try {
            System.out.println("🔍 인기 키워드 조회 시작");
            
            List<Map<String, Object>> popularKeywords = detailKeywordMapper.getPopularKeywords();
            System.out.println("📊 인기 키워드: " + popularKeywords.size() + "개");
            
            Map<String, Object> response = new HashMap<>();
            response.put("keywords", popularKeywords);
            response.put("count", popularKeywords.size());
            response.put("lastUpdated", new Date());
            
            System.out.println("✅ 인기 키워드 조회 완료");
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ 인기 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 디버그용: 모든 키워드 조회
     * @return 모든 키워드 목록
     */
    public List<Map<String, Object>> getAllKeywords() {
        try {
            System.out.println("🔍 모든 키워드 조회 시작");

            List<Map<String, Object>> allKeywords = detailKeywordMapper.getAllKeywords();
            System.out.println("📊 총 키워드 수: " + allKeywords.size());

            return allKeywords;

        } catch (Exception e) {
            System.err.println("❌ 모든 키워드 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * CLOB 데이터를 String으로 변환하는 메서드
     */
    private List<Map<String, Object>> processClobData(List<Map<String, Object>> dataList) {
        if (dataList == null || dataList.isEmpty()) {
            return dataList;
        }

        for (Map<String, Object> data : dataList) {
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                Object value = entry.getValue();
                if (value != null && value.getClass().getName().contains("oracle.sql.CLOB")) {
                    try {
                        // CLOB을 String으로 변환
                        java.sql.Clob clob = (java.sql.Clob) value;
                        String stringValue = clob.getSubString(1, (int) clob.length());
                        entry.setValue(stringValue);
                        System.out.println("🔄 CLOB 변환: " + entry.getKey() + " = " + stringValue);
                    } catch (Exception e) {
                        System.out.println("⚠️ CLOB 변환 실패: " + entry.getKey() + " - " + e.getMessage());
                        entry.setValue(""); // 빈 문자열로 대체
                    }
                }
            }
        }

        return dataList;
    }

    /**
     * 키워드 일별 통계 조회
     */
    public Map<String, Object> getKeywordDailyStats(String keywordName, String period) {
        try {
            System.out.println("📊 키워드 일별 통계 조회 시작: " + keywordName + ", 기간: " + period);

            // 1. 키워드 기본 정보 조회
            Map<String, Object> keywordInfo = detailKeywordMapper.getKeywordByName(keywordName);

            if (keywordInfo == null) {
                System.out.println("⚠️ 키워드를 찾을 수 없음: " + keywordName);
                return Map.of("error", "키워드를 찾을 수 없습니다.");
            }

            Long keywordId = ((Number) keywordInfo.get("KEYWORD_ID")).longValue();
            System.out.println("📊 키워드 ID: " + keywordId);

            // 2. 기간별 일별 통계 조회
            List<Map<String, Object>> dailyStats = detailKeywordMapper.getKeywordDailyStatsByPeriod(keywordId, period);
            System.out.println("📊 일별 통계 데이터: " + dailyStats.size() + "개");

            // 3. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("keywordInfo", keywordInfo);
            response.put("dailyStats", dailyStats);
            response.put("period", period);

            return response;

        } catch (Exception e) {
            System.err.println("❌ 키워드 일별 통계 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 키워드 감성분석 정보 조회 (별도 API)
     * @param keywordName 키워드명
     * @param period 기간 (전체, 최신순(3개월))
     * @return 감성분석 결과
     */
    public Map<String, Object> getKeywordSentimentAnalysis(String keywordName, String period) {
        try {
            System.out.println("🎯 감성분석 조회 시작 - 키워드: " + keywordName + ", 기간: " + period);

            // 1. 키워드 기본 정보 조회
            Map<String, Object> keywordInfo = detailKeywordMapper.getKeywordByName(keywordName);
            if (keywordInfo == null) {
                System.out.println("⚠️ 키워드를 찾을 수 없음: " + keywordName);
                return Map.of("error", "키워드를 찾을 수 없습니다.");
            }

            Long keywordId = ((Number) keywordInfo.get("KEYWORD_ID")).longValue();
            System.out.println("📊 키워드 ID: " + keywordId);

            // 2. 데이터 존재 여부 확인
            System.out.println("🔍 데이터 존재 여부 확인 중...");
            Map<String, Object> dataCheck = detailKeywordMapper.checkKeywordData(keywordId);
            System.out.println("📊 데이터 현황: " + dataCheck);

            // 3. 감성분석 데이터 조회 (기간별 필터링)
            Map<String, Object> sentimentParams = new HashMap<>();
            sentimentParams.put("keywordId", keywordId);
            sentimentParams.put("onlyMain", false);
            sentimentParams.put("period", period);

            // 최신순(3개월) 기간인 경우 날짜 필터 추가
            if ("최신순(3개월)".equals(period)) {
                // 키워드의 마지막 언급일 조회
                Map<String, Object> lastMentionInfo = detailKeywordMapper.getLastMentionDate(keywordId);
                if (lastMentionInfo != null && lastMentionInfo.get("LAST_DATE") != null) {
                    Object lastDate = lastMentionInfo.get("LAST_DATE");
                    // Oracle DATE 타입을 java.sql.Date로 변환
                    if (lastDate instanceof java.sql.Date) {
                        sentimentParams.put("lastMentionDate", lastDate);
                    } else if (lastDate instanceof java.util.Date) {
                        sentimentParams.put("lastMentionDate", new java.sql.Date(((java.util.Date) lastDate).getTime()));
                    } else {
                        sentimentParams.put("lastMentionDate", lastDate);
                    }
                    System.out.println("📅 마지막 언급일 기준 3개월 필터 적용: " + lastDate);
                }
            }

            List<Map<String, Object>> sentimentResults = detailKeywordMapper.getKeywordSentimentAnalysis(sentimentParams);
            System.out.println("📊 감성분석 원본 데이터: " + sentimentResults.size() + "개");

            if (sentimentResults != null && !sentimentResults.isEmpty()) {
                // JSON 배열 파싱 및 개별 감정 카운트
                Map<String, Integer> emotionCounts = parseAndCountEmotions(sentimentResults);

                // 긍정/부정별로 분류하고 TOP 3 추출
                Map<String, Integer> positiveEmotions = new HashMap<>();
                Map<String, Integer> negativeEmotions = new HashMap<>();

                for (Map.Entry<String, Integer> entry : emotionCounts.entrySet()) {
                    String emotion = entry.getKey();
                    int count = entry.getValue();
                    String sentimentType = classifyEmotion(emotion);

                    if ("positive".equals(sentimentType)) {
                        positiveEmotions.put(emotion, count);
                    } else if ("negative".equals(sentimentType)) {
                        negativeEmotions.put(emotion, count);
                    }
                }

                // TOP 3 추출
                List<Map<String, Object>> topPositive = getTopEmotions(positiveEmotions, 3);
                List<Map<String, Object>> topNegative = getTopEmotions(negativeEmotions, 3);

                // 카운트 집계
                int positiveCount = positiveEmotions.values().stream().mapToInt(Integer::intValue).sum();
                int negativeCount = negativeEmotions.values().stream().mapToInt(Integer::intValue).sum();
                int totalCount = positiveCount + negativeCount;

                System.out.println("🔍 ===== TOP 3 감정별 분석 =====");
                if (!topPositive.isEmpty()) {
                    System.out.println("👍 긍정 감정 TOP 3:");
                    topPositive.forEach(emotion ->
                        System.out.println("   • " + emotion.get("emotion") + ": " + emotion.get("count") + "개"));
                }

                if (!topNegative.isEmpty()) {
                    System.out.println("👎 부정 감정 TOP 3:");
                    topNegative.forEach(emotion ->
                        System.out.println("   • " + emotion.get("emotion") + ": " + emotion.get("count") + "개"));
                }

                // 응답 데이터 구성
                Map<String, Object> response = new HashMap<>();
                response.put("POSITIVE_COUNT", positiveCount);
                response.put("NEGATIVE_COUNT", negativeCount);
                response.put("TOTAL_COUNT", totalCount);
                response.put("TOP_POSITIVE", topPositive);
                response.put("TOP_NEGATIVE", topNegative);
                response.put("keywordName", keywordName);
                response.put("lastUpdated", new Date());

                // TOP 3 감정별 댓글 예시 추가
                response.put("POSITIVE_COMMENTS", getEmotionComments(keywordId, topPositive));
                response.put("NEGATIVE_COMMENTS", getEmotionComments(keywordId, topNegative));

                System.out.println("✅ 감성분석 완료: " + keywordName);
                return response;
            } else {
                // 데이터가 없는 경우
                Map<String, Object> response = new HashMap<>();
                response.put("POSITIVE_COUNT", 0);
                response.put("NEGATIVE_COUNT", 0);
                response.put("TOTAL_COUNT", 0);
                response.put("TOP_POSITIVE", new ArrayList<>());
                response.put("TOP_NEGATIVE", new ArrayList<>());
                response.put("keywordName", keywordName);
                response.put("message", "감성분석 데이터가 없습니다.");
                return response;
            }

        } catch (Exception e) {
            System.err.println("❌ 감성분석 조회 실패: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "감성분석 조회 중 오류가 발생했습니다.");
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * JSON 배열 형태의 감정 라벨을 파싱하여 개별 감정별 카운트
     */
    private Map<String, Integer> parseAndCountEmotions(List<Map<String, Object>> sentimentResults) {
        Map<String, Integer> emotionCounts = new HashMap<>();

        for (Map<String, Object> result : sentimentResults) {
            String label = (String) result.get("LABEL");
            if (label == null || label.trim().isEmpty()) {
                continue;
            }

            // JSON 배열 파싱: ["어이없음", "당황/난처", "놀람"] → 개별 감정들
            String[] emotions = parseJsonArray(label);

            for (String emotion : emotions) {
                emotion = emotion.trim();
                if (!emotion.isEmpty()) {
                    emotionCounts.put(emotion, emotionCounts.getOrDefault(emotion, 0) + 1);
                }
            }
        }

        return emotionCounts;
    }

    /**
     * JSON 배열 문자열을 파싱하여 개별 요소 배열로 변환
     */
    private String[] parseJsonArray(String jsonArrayString) {
        if (jsonArrayString == null || jsonArrayString.trim().isEmpty()) {
            return new String[0];
        }

        // 대괄호 제거: ["a", "b", "c"] → "a", "b", "c"
        String cleaned = jsonArrayString.trim()
            .replaceAll("^\\[", "")  // 시작 대괄호 제거
            .replaceAll("\\]$", ""); // 끝 대괄호 제거

        if (cleaned.trim().isEmpty()) {
            return new String[0];
        }

        // 쉼표로 분리하고 따옴표 제거
        return java.util.Arrays.stream(cleaned.split(","))
            .map(s -> s.trim().replaceAll("^\"|\"$", "")) // 앞뒤 따옴표 제거
            .filter(s -> !s.isEmpty())
            .toArray(String[]::new);
    }

    /**
     * 개별 감정을 긍정/부정/중립으로 분류
     */
    private String classifyEmotion(String emotion) {
        if (emotion == null || emotion.trim().isEmpty()) {
            return "neutral";
        }

        // 긍정 감정
        String[] positiveEmotions = {
            "환영/호의", "감동/감탄", "고마움", "존경", "기대감", "뿌듯함",
            "편안/쾌적", "신기함/관심", "아껴주는", "즐거움/신남", "깨달음",
            "흐뭇함(귀여움/예쁨)", "놀람", "행복", "기쁨", "안심/신뢰"
        };

        // 부정 감정
        String[] negativeEmotions = {
            "불평/불만", "지긋지긋", "슬픔", "화남/분노", "우쭐댐/무시함",
            "안타까움/실망", "비장함", "의심/불신", "부끄러움", "공포/무서움",
            "절망", "한심함", "역겨움/징그러움", "짜증", "어이없음", "패배/자기혐오",
            "귀찮음", "힘듦/지침", "죄책감", "증오/혐오", "당황/난처", "경악",
            "부담/안_내킴", "서러움", "재미없음", "불쌍함/연민", "불안/걱정"
        };

        for (String positive : positiveEmotions) {
            if (positive.equals(emotion)) {
                return "positive";
            }
        }

        for (String negative : negativeEmotions) {
            if (negative.equals(emotion)) {
                return "negative";
            }
        }

        return "neutral";
    }

    /**
     * 감정별 카운트에서 TOP N 추출
     */
    private List<Map<String, Object>> getTopEmotions(Map<String, Integer> emotionCounts, int topN) {
        return emotionCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()) // 카운트 내림차순 정렬
            .limit(topN) // TOP N 개만 선택
            .map(entry -> {
                Map<String, Object> emotion = new HashMap<>();
                emotion.put("emotion", entry.getKey());
                emotion.put("count", entry.getValue());
                return emotion;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * TOP 감정별 댓글 예시 조회
     * @param keywordId 키워드 ID
     * @param topEmotions TOP 감정 목록
     * @return 감정별 댓글 목록
     */
    private List<Map<String, Object>> getEmotionComments(Long keywordId, List<Map<String, Object>> topEmotions) {
        List<Map<String, Object>> allComments = new ArrayList<>();

        try {
            // 각 TOP 감정별로 댓글 조회 (감정당 2개씩, 총 4개 목표)
            int commentsPerEmotion = Math.max(1, 4 / Math.max(1, topEmotions.size()));

            for (Map<String, Object> emotion : topEmotions) {
                String emotionName = (String) emotion.get("emotion");
                if (emotionName == null || emotionName.trim().isEmpty()) {
                    continue;
                }

                // 감정 라벨 전처리 (SQL 안전성 확보, 길이 제한 제거)
                String safeEmotionName = emotionName
                    .replace("'", "''")  // 작은따옴표 이스케이프
                    .trim();

                System.out.println("🔍 감정 검색: '" + emotionName + "' (길이: " + emotionName.length() + ")");

                // 매퍼 파라미터 설정
                Map<String, Object> params = new HashMap<>();
                params.put("keywordId", keywordId);
                params.put("emotion", safeEmotionName);
                params.put("limit", commentsPerEmotion);

                // 해당 감정의 댓글 조회 (DBMS_LOB.INSTR 사용으로 멀티바이트 안정성 확보)
                List<Map<String, Object>> emotionComments = detailKeywordMapper.getCommentsByEmotion(params);

                if (emotionComments != null && !emotionComments.isEmpty()) {
                    allComments.addAll(emotionComments);
                    System.out.println("📝 " + emotionName + " 감정 댓글: " + emotionComments.size() + "개 (VARCHAR2 최적화)");

                    // 실제 댓글 내용 출력
                    for (int i = 0; i < Math.min(emotionComments.size(), 2); i++) {
                        Map<String, Object> comment = emotionComments.get(i);
                        System.out.println("   💬 [" + comment.get("platform") + "] " + comment.get("comment_text"));
                    }
                }

                // 총 4개 이상이면 중단
                if (allComments.size() >= 4) {
                    break;
                }
            }

            // 4개로 제한
            if (allComments.size() > 4) {
                allComments = allComments.subList(0, 4);
            }

            System.out.println("💬 총 댓글 예시: " + allComments.size() + "개");

        } catch (Exception e) {
            System.err.println("❌ 감정별 댓글 조회 실패: " + e.getMessage());
            e.printStackTrace();
        }

        return allComments;
    }
}
