package com.smhrd.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MyPageCollabDTO {
    private Long ideaId;         // 아이디어 ID
    private String userId;       // 사용자 ID
    private Long keywordId;      // 키워드 ID
    private String keywordName;  // 키워드 이름 (JOIN으로 가져옴)
    private String title;        // 콜라보 제목
    private String contentTitle; // 콘텐츠 제목
    private String contentDesc1; // 내용1
    private String contentDesc2; // 내용2
    private String contentDesc3; // 내용3
}
