package com.smhrd.web.DTO;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private NaverDTO userInfo;

    public LoginResponse() {
    }
    // 일반 로그인 용도
    public LoginResponse(boolean success, String message, String token) {
        this.success = success;
        this.message = message;
        this.token = token;
    }
    // 소셜로그인 (가입안된 유저 회원가입 유도)
    public LoginResponse(boolean success, String message, NaverDTO userInfo) {
        this.success = success;
        this.message = message;
        this.userInfo = userInfo;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public NaverDTO getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(NaverDTO userInfo) {
        this.userInfo = userInfo;
    }
}
