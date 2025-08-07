package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-4o}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 키워드에 대한 잘파세대 열광 이유 생성
     * @param keyword 키워드명
     * @return 잘파세대 열광 이유
     */
    public String generateZalpaDescription(String keyword) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ OpenAI API 키가 설정되지 않음. 기본 설명 사용");
            return getDefaultDescription(keyword);
        }

        try {
            System.out.println("🤖 OpenAI API 호출 - 키워드: " + keyword);

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // 요청 바디 설정
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                Map.of(
                    "role", "user",
                    "content", String.format(
                        "키워드 '%s'에 대해 잘파세대(Z세대, 알파세대)가 열광하는 이유를 " +
                        "한 줄로 간단하고 재미있게 설명해주세요. " +
                        "앞에 '📌 잘파세대 열광 포인트:' 같은 제목은 빼고 " +
                        "내용만 50자 이내로 작성해주세요.",
                        keyword
                    )
                )
            ));
            requestBody.put("max_tokens", 100);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    String content = (String) message.get("content");
                    
                    System.out.println("✅ OpenAI 응답 성공: " + content);
                    return content.trim();
                }
            }

            System.out.println("⚠️ OpenAI 응답이 비어있음. 기본 설명 사용");
            return getDefaultDescription(keyword);

        } catch (Exception e) {
            System.err.println("❌ OpenAI API 호출 실패: " + e.getMessage());
            e.printStackTrace();
            return getDefaultDescription(keyword);
        }
    }

    /**
     * 기본 설명 반환 (OpenAI API 실패 시)
     * @param keyword 키워드명
     * @return 기본 설명
     */
    private String getDefaultDescription(String keyword) {
        Map<String, String> defaultDescriptions = Map.of(
            "먹방", "📌 잘파세대 열광 포인트:\n달콤 바삭한 비주얼과 식감으로 SNS를 장악한 길거리 간식!",
            "간식", "📌 잘파세대 열광 포인트:\n맵고 얼얼한 중독성, 커스텀의 즐거움으로 MZ세대를 사로잡다",
            "딸기", "📌 잘파세대 열광 포인트:\n건강과 맛을 동시에, 죄책감 없이 즐기는 음료 트렌드",
            "과일", "📌 잘파세대 열광 포인트:\n신선하고 건강한 자연의 맛으로 웰빙 트렌드 선도!",
            "레시피", "📌 잘파세대 열광 포인트:\nDIY 문화와 SNS 공유로 나만의 요리 스타일 완성!",
            "초콜릿", "📌 잘파세대 열광 포인트:\n달콤한 행복과 스트레스 해소의 완벽한 조합!",
            "동결건조", "📌 잘파세대 열광 포인트:\n혁신적인 식품 기술로 새로운 식감 경험!",
            "불닭", "📌 잘파세대 열광 포인트:\n극한의 매운맛 도전과 SNS 인증샷의 완벽한 만남!",
            "요리", "📌 잘파세대 열광 포인트:\n창의적 표현과 힐링이 만나는 새로운 취미 활동!",
            "구매", "📌 잘파세대 열광 포인트:\n합리적 소비와 트렌드 추종의 스마트한 선택!"
        );

        return defaultDescriptions.getOrDefault(keyword, 
            "📌 잘파세대 열광 포인트:\n새로운 트렌드를 이끄는 핫한 키워드!");
    }
}
