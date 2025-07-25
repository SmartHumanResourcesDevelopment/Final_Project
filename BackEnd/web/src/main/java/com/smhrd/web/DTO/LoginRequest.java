package com.smhrd.web.DTO;

public class LoginRequest {
    
    private String id;
    private String password;
    private String nickname;

    // 기본 생성자
    public LoginRequest() {}

    // getter / setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNicknamed(String nickname) {
        this.nickname = nickname;
    }
}
