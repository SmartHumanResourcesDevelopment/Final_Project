package com.smhrd.web.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smhrd.web.DTO.CollabIdeaDTO;

@Service
public class ChatbotService {
    
    // OpenAIService를 주입받아 사용
    // 이 서비스는 OpenAI API와의 상호작용을 담당합니다.
    @Autowired
    private OpenAIService openAIService;

    /**
     * 주어진 키워드로 AI 콜라보 아이디어를 생성합니다.
     * @param keyword 검색 키워드
     * @return 생성된 콜라보 아이디어 리스트
     */
    public List<CollabIdeaDTO> generateCollabIdeas(String keyword) {
        System.out.println("🤖 '" + keyword + "' 키워드로 AI 콜라보 아이디어 생성 시작 (in ChatbotService)");
    
    try {
            // 1. AI에게 전달할 프롬프트(명령어)를 구체적으로 작성합니다.
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
            // 2. OpenAIService를 호출하여 AI의 답변을 받습니다.
            String aiResponse = openAIService.generateInsight(prompt);
            System.out.println("========================================");
            System.out.println("🤖 AI의 실제 응답 원본 텍스트:");
            System.out.println(aiResponse);
            System.out.println("========================================");

            // 3. AI가 생성한 텍스트를 파싱하여 DTO 리스트로 변환합니다.
            List<CollabIdeaDTO> ideaList = new ArrayList<>();
            String[] ideaBlocks = aiResponse.split("---");

            for (String block : ideaBlocks) {
                if (block.trim().isEmpty()) continue;

                String[] lines = block.trim().split("\n");
                CollabIdeaDTO ideaDto = new CollabIdeaDTO();
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

            } catch (Exception e) {
                System.err.println("❌ AI 콜라보 아이디어 생성 실패: " + e.getMessage());
                e.printStackTrace();

                // 4. 실패 시, 비상용 더미 데이터를 반환합니다.
                List<CollabIdeaDTO> fallbackIdeas = new ArrayList<>();
                fallbackIdeas.add(new CollabIdeaDTO(
                    "AI 생성 실패! 더미 제목 1",
                    Arrays.asList("더미 내용 1-1", "더미 내용 1-2", "더미 내용 1-3")
                ));
                fallbackIdeas.add(new CollabIdeaDTO(
                    "AI 생성 실패! 더미 제목 2",
                    Arrays.asList("더미 내용 2-1", "더미 내용 2-2", "더미 내용 2-3")
                ));
                return fallbackIdeas;
            }
        }


}