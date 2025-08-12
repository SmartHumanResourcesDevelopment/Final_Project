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

    private final RestTemplate restTemplate;

    // RestTemplate 생성자에서 타임아웃 설정
    public OpenAIService() {
        this.restTemplate = new RestTemplate();
        // HTTP 클라이언트 팩토리 설정으로 타임아웃 적용
        this.restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
            setConnectTimeout(30000); // 연결 타임아웃 30초
            setReadTimeout(45000);    // 읽기 타임아웃 45초
        }});
    }

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
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    @SuppressWarnings("unchecked")
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
     * 트렌드 인사이트 생성
     * @param prompt 분석 요청 프롬프트
     * @return OpenAI 생성 인사이트
     */
    public String generateInsight(String prompt) {
        // 실제 OpenAI API 사용 (타임아웃 넉넉히 설정)
        System.out.println("🤖 OpenAI API로 실제 AI 요약 생성 시작");

        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ OpenAI API 키가 설정되지 않음. 기본 인사이트 사용");
            return getDefaultInsight(prompt);
        }

        try {
            System.out.println("🤖 OpenAI 인사이트 생성 API 호출");
            System.out.println("📋 프롬프트: " + prompt);

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // 요청 바디 설정
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o");
            requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    String content = (String) message.get("content");

                    System.out.println("✅ OpenAI 인사이트 생성 성공: " + content);
                    return content.trim();
                }
            }

            System.out.println("⚠️ OpenAI 응답이 비어있음. 기본 인사이트 사용");
            return getDefaultInsight(prompt);

        } catch (Exception e) {
            System.err.println("❌ OpenAI 인사이트 생성 실패: " + e.getMessage());
            e.printStackTrace();
            return getDefaultInsight(prompt);
        }
    }

    /**
     * 기본 인사이트 생성 (OpenAI API 대신 사용)
     * @param prompt 분석 요청 프롬프트
     * @return 기본 인사이트 문구
     */
    private String getDefaultInsight(String prompt) {
        // 프롬프트에서 키워드와 기간 추출
        if (prompt.contains("먹방") && prompt.contains("간식") && prompt.contains("딸기")) {
            if (prompt.contains("일별")) {
                return "먹방, 간식, 딸기 키워드가 일별 트렌드에서 각각 다른 패턴을 보이고 있습니다. 먹방은 꾸준한 상승세를, 간식은 안정적인 성장을, 딸기는 계절적 변동성을 나타내며 다양한 소비자 니즈를 반영하고 있습니다.";
            } else if (prompt.contains("주별")) {
                return "주별 분석 결과, 먹방 콘텐츠의 지속적인 인기와 간식 트렌드의 다양화, 그리고 딸기의 계절적 특성이 뚜렷하게 나타나고 있습니다. 이는 콘텐츠 소비 패턴과 식품 트렌드의 복합적 영향을 보여줍니다.";
            } else {
                return "월별 트렌드 분석 결과, 먹방은 지속적인 성장세를, 간식은 꾸준한 관심도를, 딸기는 계절성을 반영한 변화를 보이고 있습니다. 이는 디지털 콘텐츠와 식품 트렌드가 서로 영향을 미치며 새로운 소비 문화를 형성하고 있음을 시사합니다.";
            }
        }

        // 기본 인사이트
        return "최근 트렌드 분석 결과, 다양한 음식 키워드들이 각각 독특한 성장 패턴을 보이며 소비자들의 관심을 끌고 있습니다. 이는 음식 문화의 다양화와 개인 취향의 세분화를 반영하는 현상으로 해석됩니다.";
    }

    /**
     * OpenAI API 연결 테스트
     * @return 연결 성공 여부
     */
    public boolean testConnection() {
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ OpenAI API 키가 설정되지 않음");
            return false;
        }

        try {
            System.out.println("🔍 OpenAI API 연결 테스트 시작");

            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // 간단한 테스트 요청
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("messages", List.of(
                Map.of("role", "user", "content", "Hello")
            ));
            requestBody.put("max_tokens", 5);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // API 호출 (짧은 타임아웃 설정)
            RestTemplate testTemplate = new RestTemplate();
            testTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(10000); // 연결 타임아웃 10초
                setReadTimeout(15000);    // 읽기 타임아웃 15초
            }});

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = testTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            boolean isSuccess = response.getStatusCode() == HttpStatus.OK && response.getBody() != null;
            System.out.println(isSuccess ? "✅ OpenAI API 연결 테스트 성공" : "❌ OpenAI API 연결 테스트 실패");

            return isSuccess;

        } catch (Exception e) {
            System.err.println("❌ OpenAI API 연결 테스트 실패: " + e.getMessage());
            return false;
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
