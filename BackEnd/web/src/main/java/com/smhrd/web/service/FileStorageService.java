package com.smhrd.web.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    public FileStorageService() {
        // 초기화는 @PostConstruct에서 수행
    }

    @PostConstruct
    public void init() {
        try {
            // WebConfig와 동일한 방식으로 경로 설정
            Path cwd = Paths.get(System.getProperty("user.dir"));
            Path projectRoot = cwd.getParent().getParent();
            this.rootLocation = projectRoot.resolve(uploadDir).toAbsolutePath();

            log.info("📁 FileStorageService 초기화 (WebConfig와 동일한 방식)");
            log.info("   - 현재 작업 디렉토리: {}", cwd);
            log.info("   - 프로젝트 루트: {}", projectRoot);
            log.info("   - uploadDir 설정값: {}", uploadDir);
            log.info("   - 최종 업로드 디렉토리: {}", rootLocation);

            Files.createDirectories(rootLocation);
            log.info("✅ 업로드 디렉토리 생성/확인 완료: {}", rootLocation);

        } catch (IOException e) {
            log.error("❌ 업로드 디렉토리 생성 실패: {}", e.getMessage());
            throw new RuntimeException("업로드 디렉토리 생성 실패", e);
        }
    }

    /**
     * MultipartFile 을 받아 로컬에 저장 후, public에서 접근 가능한 URL을 리턴
     */
    public String store(MultipartFile file) {
        log.info("📁 파일 저장 시작");
        log.info("   - 원본 파일명: {}", file.getOriginalFilename());
        log.info("   - 파일 크기: {} bytes", file.getSize());
        log.info("   - 저장 위치: {}", rootLocation);

        // 1) 원본 파일명에서 확장자 추출
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        // 2) UUID 기반 저장 파일명 생성
        String filename = UUID.randomUUID().toString() + ext;
        log.info("   - 생성된 파일명: {}", filename);

        try {
            // 3) 파일 복사
            Path destinationFile = this.rootLocation.resolve(filename)
                .normalize().toAbsolutePath();
            log.info("   - 최종 저장 경로: {}", destinationFile);

            file.transferTo(destinationFile.toFile());
            log.info("✅ 파일 저장 성공: {}", destinationFile);

            // 4) 애플리케이션이 static으로 제공하도록 설정된 URL 리턴
            //    예: /uploads/{filename}
            String url = "/uploads/" + filename;
            log.info("   - 반환 URL: {}", url);
            return url;
        } catch (IOException e) {
            log.error("❌ 파일 저장 실패: {}", filename, e);
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
