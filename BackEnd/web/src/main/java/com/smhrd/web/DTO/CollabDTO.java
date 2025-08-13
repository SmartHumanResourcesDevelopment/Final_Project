package com.smhrd.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class CollabDTO {
    private Long ideaId;         // 아이디어 아이디
    private String userId;       // 작성자 아이디
    private Long keywordId;      // 키워드 아이디
    private String keywordName;  // 키워드 이름
    private String title;        // 제목
    private String contentTitle; // 콘텐츠 제목
    private String contentDesc1; // 내용1
    private String contentDesc2; // 내용2
    private String contentDesc3; // 내용3
}
