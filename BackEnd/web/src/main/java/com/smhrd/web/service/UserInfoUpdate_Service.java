package com.smhrd.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.web.DTO.UserInfoUpdate_DTO;
import com.smhrd.web.repository.UserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
    // 멀티파트 파일 저장 후 URL 리턴
    public String storeProfileImageAndGetUrl(MultipartFile file) {
        // fileStorageService.store() 메서드가 실제 저장하고 public URL을 리턴
        return fileStorageService.store(file);
    }


    public boolean updateUserProfile(String userId, String imageUrl) {
        return userMapper.updateUserProfileById(userId, imageUrl) > 0;
    }


   

}