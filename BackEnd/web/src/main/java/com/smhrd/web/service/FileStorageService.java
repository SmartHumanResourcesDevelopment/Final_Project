package com.smhrd.web.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    // 업로드된 파일을 저장할 루트 디렉토리 (프로젝트 외부 절대경로 권장)
    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패", e);
        }
    }

    /** 
     * MultipartFile 을 받아 로컬에 저장 후, public에서 접근 가능한 URL을 리턴 
     */
    public String store(MultipartFile file) {
        // 1) 원본 파일명에서 확장자 추출
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        // 2) UUID 기반 저장 파일명 생성
        String filename = UUID.randomUUID().toString() + ext;

        try {
            // 3) 파일 복사
            Path destinationFile = this.rootLocation.resolve(filename)
                .normalize().toAbsolutePath();
            file.transferTo(destinationFile.toFile());

            // 4) 애플리케이션이 static으로 제공하도록 설정된 URL 리턴
            //    예: /uploads/{filename}
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + filename, e);
        }
    }

    /** 선택 사항: 파일을 읽기 위한 Resource 로더 */
    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 찾을 수 없습니다: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("잘못된 URL: " + filename, e);
        }
    }
}
