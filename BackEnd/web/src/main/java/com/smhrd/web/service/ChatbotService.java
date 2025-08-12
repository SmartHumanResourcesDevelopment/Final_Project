package com.smhrd.web.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.web.DTO.ChatBotIdeaDTO; // DTO를 재사용합니다.

@Service
public class ChatbotService {
    
    @Autowired
    private OpenAIService openAIService;


    // 1. 콜라보 아이디어 생성

    /**
     * 키워드를 기반으로 AI 콜라보 아이디어를 생성합니다.
     * @param keyword 검색 키워드
     * @return 생성된 콜라보 아이디어 리스트
     */
    public List<ChatBotIdeaDTO> generateCollabIdeas(String keyword) {
        System.out.println("🤖 '" + keyword + "' 키워드로 AI 콜라보 아이디어 생성 시작");
    
        try {
            String prompt = String.format(
                "당신은 Z세대를 위한 트렌디한 마케팅 아이디어 전문가입니다.\n" +
                "주제 키워드: '%s'\n\n" +
                "요청: 위 주제를 활용하여 콜라보레이션 아이디어 3개를 생성해주세요.\n\n" +
                "규칙:\n" +
                "1. 반드시 3개의 아이디어를 생성해야 합니다.\n" +
                "2. 각 아이디어에 대한 CONTENT는 반드시 3개 작성해야 합니다.\n" +
                "3. 각 아이디어는 'TITLE:', 'CONTENT:', '---' 형식과 순서를 반드시 지켜야 합니다.\n" +
                "4. 'TITLE:'은 15자 내외로 작성해주세요.\n" +
                "5. 'CONTENT:'는 아이디어를 구체적으로 설명하는 60~90자 내외의 완전한 문장으로 작성해줘.\n" +
                "6. 다른 부가적인 설명이나 인사는 절대 포함하지 마세요.\n\n" +
                "7. 답변은 반드시 한국어로만 작성해야 합니다.\n\n" +
                "--- (예시 형식) ---\n" +
                "TITLE: [아이디어 1 제목]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 2 제목]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 3 제목]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "---",
                keyword
            );
            
            String aiResponse = openAIService.generateInsight(prompt);
            System.out.println("💡 AI 콜라보 응답 원본:\n" + aiResponse);
            
            return parseAIResponse(aiResponse);

        } catch (Exception e) {
            System.err.println("❌ AI 콜라보 아이디어 생성 실패: " + e.getMessage());
            return getFallbackIdeas("콜라보 아이디어");
        }
    }


    // 2. 제품 아이디어 생성

    /**
     * 키워드를 기반으로 AI 제품 아이디어를 생성합니다.
     * @param keyword 검색 키워드
     * @return 생성된 제품 아이디어 리스트
     */
    public List<ChatBotIdeaDTO> generateProductIdeas(String keyword) {
        System.out.println("🤖 '" + keyword + "' 키워드로 AI 제품 아이디어 생성 시작");
    
        try {
            String prompt = String.format(
                "당신은 Z세대를 위한 혁신적인 신제품 개발 전문가입니다.\n" +
                "주제 키워드: '%s'\n\n" +
                "요청: 위 주제를 활용하여 시장에 없던 새로운 제품 아이디어 3개를 생성해주세요.\n\n" +
                "규칙:\n" +
                "1. 반드시 3개의 아이디어를 생성해야 합니다.\n" +
                "2. 각 아이디어에 대한 CONTENT는 반드시 3개 작성해야 합니다.\n" +
                "3. 각 아이디어는 'TITLE:', 'CONTENT:', '---' 형식과 순서를 반드시 지켜야 합니다.\n" +
                "4. 'TITLE:'은 15자 내외로 작성해주세요.\n" +
                "5. 'CONTENT:'는 아이디어를 구체적으로 설명하는 60~90자 내외의 완전한 문장으로 작성해줘.\n" +
                "6. 다른 부가적인 설명이나 인사는 절대 포함하지 마세요.\n\n" +
                "7. 답변은 반드시 한국어로만 작성해야 합니다.\n\n" +
                "--- (예시 형식) ---\n" +
                "TITLE: [아이디어 1 제목]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 2 제목]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 3 제목]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "---",
                keyword
            );

            String aiResponse = openAIService.generateInsight(prompt);
            System.out.println("💡 AI 제품 응답 원본:\n" + aiResponse);

            return parseAIResponse(aiResponse);

        } catch (Exception e) {
            System.err.println("❌ AI 제품 아이디어 생성 실패: " + e.getMessage());
            return getFallbackIdeas("제품 아이디어");
        }
    }


    // 3. 슬로건 생성 (신규 추가)

    /**
     * 키워드를 기반으로 AI 슬로건/마케팅 문구를 생성합니다.
     * @param keyword 검색 키워드
     * @return 생성된 슬로건 리스트
     */
    public List<ChatBotIdeaDTO> generateSlogans(String keyword) {
        System.out.println("🤖 '" + keyword + "' 키워드로 AI 슬로건 생성 시작");
    
        try {
            String prompt = String.format(
                "당신은 Z세대의 마음을 사로잡는 카피라이터입니다.\n" +
                "주제 키워드: '%s'\n\n" +
                "요청: 위 주제를 활용하여 시선을 끄는 슬로건 또는 마케팅 문구 3개를 생성해주세요.\n\n" +
                "규칙:\n" +
                "1. 반드시 3개의 아이디어를 생성해야 합니다.\n" +
                "2. 각 아이디어에 대한 CONTENT는 반드시 3개 작성해야 합니다.\n" +
                "3. 각 아이디어는 'TITLE:', 'CONTENT:', '---' 형식과 순서를 반드시 지켜야 합니다.\n" +
                "4. 'TITLE:'은 15자 내외로 작성해주세요.\n" +
                "5. 'CONTENT:'는 아이디어를 구체적으로 설명하는 30~40자 내외의 완전한 문장으로 작성해줘.\n" +
                "6. 다른 부가적인 설명이나 인사는 절대 포함하지 마세요.\n\n" +
                "7. 답변은 반드시 한국어로만 작성해야 합니다.\n\n" +
                "--- (예시 형식) ---\n" +
                "TITLE: [아이디어 1 제목]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "CONTENT: [아이디어 1 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 2 제목]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "CONTENT: [아이디어 2 내용]\n" +
                "---\n" +
                "TITLE: [아이디어 3 제목]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "CONTENT: [아이디어 3 내용]\n" +
                "---",
                keyword
            );

            String aiResponse = openAIService.generateInsight(prompt);
            System.out.println("💡 AI 슬로건 응답 원본:\n" + aiResponse);

            return parseAIResponse(aiResponse);

        } catch (Exception e) {
            System.err.println("❌ AI 슬로건 생성 실패: " + e.getMessage());
            return getFallbackIdeas("슬로건");
        }
    }


    // 4. 공통 로직 (파싱, 비상 응답)

    /**
     * AI의 텍스트 응답을 DTO 리스트로 파싱하는 공통 메소드입니다.
     * @param aiResponse AI가 생성한 원본 텍스트
     * @return 파싱된 아이디어 DTO 리스트
     */
    private List<ChatBotIdeaDTO> parseAIResponse(String aiResponse) {
        List<ChatBotIdeaDTO> ideaList = new ArrayList<>();
        String[] ideaBlocks = aiResponse.split("---");

        for (String block : ideaBlocks) {
            if (block.trim().isEmpty()) continue;

            String[] lines = block.trim().split("\n");
            ChatBotIdeaDTO ideaDto = new ChatBotIdeaDTO();
            List<String> contents = new ArrayList<>();
            
            for (String line : lines) {
                if (line.startsWith("TITLE:")) {
                    ideaDto.setTitle(line.substring("TITLE:".length()).trim());
                } else if (line.startsWith("CONTENT:")) {
                    contents.add(line.substring("CONTENT:".length()).trim());
                }
            }
            
            if (ideaDto.getTitle() != null && !contents.isEmpty()) {
                ideaDto.setContents(contents);
                ideaList.add(ideaDto);
            }
        }
        System.out.println("✅ AI 아이디어 파싱 완료: " + ideaList.size() + "개");
        return ideaList;
    }

    /**
     * AI API 호출 실패 시 반환할 비상용 더미 데이터를 생성합니다.
     * @param type 아이디어 종류 (예: "콜라보", "제품")
     * @return 비상용 아이디어 DTO 리스트
     */
    private List<ChatBotIdeaDTO> getFallbackIdeas(String type) {
        List<ChatBotIdeaDTO> fallbackIdeas = new ArrayList<>();
        fallbackIdeas.add(new ChatBotIdeaDTO(
            "AI " + type + " 생성 실패!",
            Arrays.asList("잠시 후 다시 시도해주세요.", "네트워크 연결을 확인해주세요.", "문제가 계속되면 관리자에게 문의하세요.")
        ));
        return fallbackIdeas;
    }
}
