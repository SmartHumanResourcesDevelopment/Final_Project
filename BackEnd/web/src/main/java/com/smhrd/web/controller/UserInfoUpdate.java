package com.smhrd.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.web.DTO.UserInfoUpdate_DTO;
import com.smhrd.web.service.UserInfoUpdate_Service;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserInfoUpdate {

    @Autowired
    private UserInfoUpdate_Service userInfoService;

    /** 기존 회원정보 수정 메서드 */
    @PostMapping("/update")
    public ResponseEntity<?> updateUserInfo(@RequestBody UserInfoUpdate_DTO dto) {
         System.out.println("🟡 [DEBUG] 전달된 DTO: " + dto);
        boolean result = userInfoService.user_info_update_service(dto);
        if (result) {
            return ResponseEntity.ok("수정 성공");
        } else {
            return ResponseEntity.status(400).body("수정 실패");
        }
    }

    /** 프로필 사진 변경: multipart/form-data 처리 */
    @PostMapping(
      value = "/    ",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateProfile(
        @RequestPart("user_id") String userId,
        @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            // 1) 저장된 파일 URL 결정
            String imageUrl;
            if (file != null && !file.isEmpty()) {
                // fileStorageService 는 직접 구현한 저장 서비스 (로컬 또는 S3 등)
                imageUrl = userInfoService.storeProfileImageAndGetUrl(file);
            } else {
                // 선택된 파일이 없으면 기본 이미지 경로를 그대로 사용
                imageUrl = "/img/user.png";
            }

            // 2) DB에 URL 업데이트
            boolean ok = userInfoService.updateUserProfile(userId, imageUrl);
            if (!ok) {
                return ResponseEntity.status(400).body("프로필 사진 변경 실패");
            }

            // 3) 클라이언트에 새 URL 반환
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));

        } catch (Exception e) {
            // 예외 로깅
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("서버 오류 발생: " + e.getMessage());
        }
    }
}
