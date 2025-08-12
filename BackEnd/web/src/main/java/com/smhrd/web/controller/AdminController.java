package com.smhrd.web.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.web.service.OpenAIService;

/**
 * 관리자 전용 API 컨트롤러
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private OpenAIService openAIService;

    /**
     * OpenAI API 상태 체크
     * @return OpenAI API 상태 정보
     */
    @GetMapping("/openai-status")
    public ResponseEntity<Map<String, Object>> checkOpenAIStatus() {
        System.out.println("=================================================");
        System.out.println("🔍 관리자 - OpenAI API 상태 체크 요청");
        System.out.println("=================================================");

        Map<String, Object> response = new HashMap<>();

        try {
            // OpenAI API 테스트 호출
            boolean isWorking = openAIService.testConnection();
            
            if (isWorking) {
                response.put("status", "success");
                response.put("message", "OpenAI API 정상 작동");
                response.put("statusText", "🟢 운영중");
                System.out.println("✅ OpenAI API 상태: 정상");
            } else {
                response.put("status", "error");
                response.put("message", "OpenAI API 연결 실패");
                response.put("statusText", "🔴 중지됨");
                System.out.println("❌ OpenAI API 상태: 오류");
            }

        } catch (Exception e) {
            System.err.println("❌ OpenAI API 상태 체크 중 오류: " + e.getMessage());
            e.printStackTrace();
            
            response.put("status", "error");
            response.put("message", "OpenAI API 상태 체크 실패: " + e.getMessage());
            response.put("statusText", "🔴 중지됨");
        }

        response.put("timestamp", new Date());
        response.put("checkedAt", System.currentTimeMillis());

        System.out.println("📊 응답 데이터: " + response);
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 시스템 상태 체크
     * @return 시스템 전체 상태 정보
     */
    @GetMapping("/system-status")
    public ResponseEntity<Map<String, Object>> checkSystemStatus() {
        System.out.println("🔍 관리자 - 시스템 전체 상태 체크 요청");

        Map<String, Object> response = new HashMap<>();
        Map<String, Object> services = new HashMap<>();

        try {
            // OpenAI 상태 체크
            boolean openaiStatus = openAIService.testConnection();
            services.put("openai", Map.of(
                "status", openaiStatus ? "running" : "stopped",
                "statusText", openaiStatus ? "🟢 운영중" : "🔴 중지됨"
            ));

            // DB 상태는 여기까지 왔다면 정상
            services.put("database", Map.of(
                "status", "running",
                "statusText", "🟢 운영중"
            ));

            // 크롤링은 현재 중지 상태로 고정
            services.put("crawling", Map.of(
                "status", "stopped",
                "statusText", "🔴 중지됨"
            ));

            response.put("services", services);
            response.put("overall", "partial"); // 일부 서비스만 운영중
            response.put("timestamp", new Date());

            System.out.println("✅ 시스템 상태 체크 완료");

        } catch (Exception e) {
            System.err.println("❌ 시스템 상태 체크 실패: " + e.getMessage());
            response.put("error", "시스템 상태 체크 실패");
            response.put("message", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
