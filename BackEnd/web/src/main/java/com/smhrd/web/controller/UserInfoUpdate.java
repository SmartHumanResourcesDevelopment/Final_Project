package com.smhrd.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.web.DTO.UserInfoUpdate_DTO;
import com.smhrd.web.service.UserInfoUpdate_Service;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserInfoUpdate {

    @Autowired
    private UserInfoUpdate_Service userInfoService;

    /** 기존 회원정보 수정 메서드 */
    @PostMapping("/update")
    public ResponseEntity<?> updateUserInfo(@RequestBody UserInfoUpdate_DTO dto) {
        boolean result = userInfoService.user_info_update_service(dto);
        if (result) {
            return ResponseEntity.ok("수정 성공");
        } else {
            return ResponseEntity.status(400).body("수정 실패");
        }
    }

    /** 프로필 사진 변경: multipart/form-data 처리 */
 @PostMapping(
  value    = "/updateProfile",
  consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<?> updateProfile(
    @RequestParam("user_id") String userId,
    @RequestPart("file") MultipartFile file     // ← required=true 로 변경
) {
    log.info("[updateProfile] userId={}, file present={}", userId, !file.isEmpty());
    try {
        if (file.isEmpty()) {
            // 파일이 없으면 잘못된 요청으로 400 반환
            return ResponseEntity
                   .badRequest()
                   .body("업로드할 파일이 없습니다.");
        }
        // 새 파일이 들어왔을 때만 저장 및 DB 업데이트
        String imageUrl = userInfoService.storeProfileImageAndGetUrl(file);
        boolean ok = userInfoService.updateUserProfile(userId, imageUrl);
        if (!ok) {
            return ResponseEntity
                   .status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("프로필 사진 저장 실패");
        }
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    } catch (Exception e) {
        log.error("[updateProfile] error for userId=" + userId, e);
        return ResponseEntity
               .status(HttpStatus.INTERNAL_SERVER_ERROR)
               .body("서버 오류 발생: " + e.getMessage());
    }
}
}