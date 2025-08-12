package com.smhrd.web.DTO;

/**
 * TOP 10 랭킹 데이터 DTO
 * 프로시저 결과를 안전하게 받기 위한 클래스
 */
public class Top10DTO {
    
    private Integer rank;      // 순위
    private String name;       // 키워드명
    private Integer count;     // 언급 횟수
    private String trend;      // 트렌드 (⬆↔⬇)
    private String color;      // 색상 코드
    
    // 기본 생성자
    public Top10DTO() {}
    
    // 전체 파라미터 생성자
    public Top10DTO(Integer rank, String name, Integer count, String trend, String color) {
        this.rank = rank;
        this.name = name;
        this.count = count;
        this.trend = trend;
        this.color = color;
    }
    
    // Getter & Setter
    public Integer getRank() {
        return rank;
    }
    
    public void setRank(Integer rank) {
        this.rank = rank;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getCount() {
        return count;
    }
    
    public void setCount(Integer count) {
        this.count = count;
    }
    
    public String getTrend() {
        return trend;
    }
    
    public void setTrend(String trend) {
        this.trend = trend;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    // toString 메서드
    @Override
    public String toString() {
        return "Top10DTO{" +
                "rank=" + rank +
                ", name='" + name + '\'' +
                ", count=" + count +
                ", trend='" + trend + '\'' +
                ", color='" + color + '\'' +
                '}';
    }
    
    // Map으로 변환하는 메서드 (기존 코드 호환성을 위해)
    public java.util.Map<String, Object> toMap() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("rank", this.rank);
        map.put("name", this.name);
        map.put("count", this.count);
        map.put("trend", this.trend);
        map.put("color", this.color);
        return map;
    }
}
