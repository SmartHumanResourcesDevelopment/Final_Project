package com.smhrd.web.DTO;

import java.util.List;

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
public class ChatBotIdeaDTO {
    private String title;       // 아이디어 제목
    private List<String> contents;  // 제목에 해당하는 내용 글 목록 (3개)
}
