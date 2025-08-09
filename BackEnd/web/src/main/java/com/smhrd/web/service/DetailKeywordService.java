package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smhrd.web.repository.DetailKeywordMapper;
import java.util.*;
import java.util.LinkedHashSet;

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

            // 4. 감성분석 정보 조회
            Map<String, Object> sentimentAnalysis = null;
            List<Map<String, Object>> positiveComments = new ArrayList<>();
            List<Map<String, Object>> negativeComments = new ArrayList<>();

            System.out.println("🎯 감성분석 조회 시작 - 키워드 ID: " + keywordId);
            try {
                // 먼저 데이터 존재 여부 확인
                System.out.println("🔍 데이터 존재 여부 확인 중...");
                Map<String, Object> dataCheck = detailKeywordMapper.checkKeywordData(keywordId);
                System.out.println("📊 데이터 현황: " + dataCheck);

                // 매퍼에서 Map 파라미터를 받으므로 Map으로 전달
                Map<String, Object> sentimentParams = new HashMap<>();
                sentimentParams.put("keywordId", keywordId);
                sentimentParams.put("onlyMain", false); // 모든 감정 포함

                sentimentAnalysis = detailKeywordMapper.getKeywordSentimentAnalysis(sentimentParams);
                System.out.println("📊 감성분석 정보 조회 결과: " + sentimentAnalysis);

                if (sentimentAnalysis != null) {
                    // 감성분석 결과 상세 출력
                    Object positiveCount = sentimentAnalysis.get("POSITIVE_COUNT");
                    Object negativeCount = sentimentAnalysis.get("NEGATIVE_COUNT");
                    Object totalCount = sentimentAnalysis.get("TOTAL_COUNT");

                    System.out.println("🎯 ===== 키워드 '" + keywordInfo.get("KEYWORD_NAME") + "' 총 감정 분석 결과 =====");
                    System.out.println("👍 긍정 감정: " + positiveCount + "개");
                    System.out.println("👎 부정 감정: " + negativeCount + "개");
                    System.out.println("📊 총 감정: " + totalCount + "개");

                    if (totalCount != null && ((Number) totalCount).intValue() > 0) {
                        double positiveRatio = ((Number) positiveCount).doubleValue() / ((Number) totalCount).doubleValue() * 100;
                        double negativeRatio = ((Number) negativeCount).doubleValue() / ((Number) totalCount).doubleValue() * 100;
                        System.out.println("📈 긍정 비율: " + String.format("%.1f", positiveRatio) + "%");
                        System.out.println("📉 부정 비율: " + String.format("%.1f", negativeRatio) + "%");

                        if (positiveRatio > negativeRatio) {
                            System.out.println("✨ 전체적으로 긍정적인 키워드입니다!");
                        } else if (negativeRatio > positiveRatio) {
                            System.out.println("⚠️ 전체적으로 부정적인 키워드입니다!");
                        } else {
                            System.out.println("⚖️ 긍정과 부정이 균형을 이루는 키워드입니다!");
                        }
                    }

                    // 상세 감정별 카운트 조회 및 출력
                    try {
                        List<Map<String, Object>> detailedSentiments = detailKeywordMapper.getKeywordDetailedSentiments(sentimentParams);
                        if (!detailedSentiments.isEmpty()) {
                            System.out.println("🔍 ===== 상세 감정별 분석 =====");

                            // 긍정 감정들
                            System.out.println("👍 긍정 감정 상세:");
                            detailedSentiments.stream()
                                .filter(s -> "positive".equals(s.get("SENTIMENT_TYPE")))
                                .forEach(s -> System.out.println("   • " + s.get("EMOTION_LABEL") + ": " + s.get("COUNT") + "개"));

                            // 부정 감정들
                            System.out.println("👎 부정 감정 상세:");
                            detailedSentiments.stream()
                                .filter(s -> "negative".equals(s.get("SENTIMENT_TYPE")))
                                .forEach(s -> System.out.println("   • " + s.get("EMOTION_LABEL") + ": " + s.get("COUNT") + "개"));

                            // 중립 감정들 (있다면)
                            long neutralCount = detailedSentiments.stream()
                                .filter(s -> "neutral".equals(s.get("SENTIMENT_TYPE")))
                                .count();
                            if (neutralCount > 0) {
                                System.out.println("😐 중립 감정 상세:");
                                detailedSentiments.stream()
                                    .filter(s -> "neutral".equals(s.get("SENTIMENT_TYPE")))
                                    .forEach(s -> System.out.println("   • " + s.get("EMOTION_LABEL") + ": " + s.get("COUNT") + "개"));
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("⚠️ 상세 감정 정보 조회 실패: " + e.getMessage());
                    }

                    System.out.println("================================================");

                    // 랜덤 댓글 3개 조회 (긍정/부정 구분 없이)
                    Map<String, Object> commentParams = new HashMap<>();
                    commentParams.put("keywordId", keywordId);
                    commentParams.put("limit", 3);

                    List<Map<String, Object>> randomComments = detailKeywordMapper.getRandomCommentsByKeyword(commentParams);

                    // 임시로 모든 댓글을 긍정으로 분류 (나중에 감정별 분류 로직 추가 가능)
                    positiveComments = randomComments;
                    negativeComments = new ArrayList<>(); // 빈 리스트

                    System.out.println("📊 긍정 댓글: " + positiveComments.size() + "개");
                    System.out.println("📊 부정 댓글: " + negativeComments.size() + "개");
                }

            } catch (Exception e) {
                System.out.println("⚠️ 감성분석 정보 조회 실패: " + e.getMessage());
                // 감성분석 정보가 없어도 계속 진행
            }

            // 5. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("keywordInfo", keywordInfo);
            response.put("mainStats", mainStats);
            response.put("similarityInfo", similarityInfo);
            response.put("similarKeywords", similarKeywordDetails);
            response.put("sentimentAnalysis", sentimentAnalysis);
            response.put("positiveComments", positiveComments);
            response.put("negativeComments", negativeComments);
            response.put("lastUpdated", new Date());
            
            System.out.println("✅ 키워드 상세 정보 조회 완료: " + keywordName);
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
}
