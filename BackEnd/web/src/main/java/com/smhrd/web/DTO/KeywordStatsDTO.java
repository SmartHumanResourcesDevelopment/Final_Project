package com.smhrd.web.DTO;

import lombok.Data;
import java.sql.Date;  // java.sql.Date 임포트

@Data
public class KeywordStatsDTO {
    private Date statsDate;      // java.sql.Date 타입으로 변경
    private Integer totalCount;
}