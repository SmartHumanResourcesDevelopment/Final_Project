package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.web.DTO.UserInfoUpdate_DTO;
import com.smhrd.web.repository.UserMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Slf4j
@Service
public class UserInfoUpdate_Service {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FileStorageService fileStorageService;

    public boolean user_info_update_service(UserInfoUpdate_DTO dto) {
        // 비밀번호가 비어있지 않으면 암호화
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            String encPw = passwordEncoder.encode(dto.getPassword());
            dto.setPassword(encPw);
        }
        if(userMapper.UserInfoUpdate(dto) > 0){
            return true;
        }
    
        return false;
    }
   
    public String storeProfileImageAndGetUrl(MultipartFile file) {
        // ① 주입된 빈이 null 인지 확인
        log.info("[DEBUG] fileStorageService == null? {}", fileStorageService == null);
        log.info("[DEBUG] userMapper == null? {}", userMapper == null);

        // ② 기존 로그
        log.info("[storeProfileImage] filename={}, size={}", 
                 file.getOriginalFilename(), file.getSize());

        // ③ 실제 저장 호출 (혹시 주석 처리했다면 다시 복원)
        String url = fileStorageService.store(file);
        log.info("[storeProfileImage] completed: url={}", url);
        return url;
    }

    public boolean updateUserProfile(String userId, String imageUrl) {
        log.info("[updateUserProfile] userId={}, imageUrl={}", userId, imageUrl);
        log.info("[DEBUG] userMapper == null? {}", userMapper == null);

        int updated = userMapper.updateUserProfileById(userId, imageUrl);
        boolean success = (updated > 0);
        log.info("[updateUserProfile] completed: success={}", success);
        return success;
    }

    public String getCurrentProfileUrl(String userId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getCurrentProfileUrl'");
    }

}