package com.smhrd.web.DTO;

public class LoginResponse {
    
    private boolean success;
    private String message;
    private String user;

    // 기본 생성자
     public LoginResponse() {}
    
    // 생성자
    public LoginResponse(boolean success, String message, String user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    // getter / setter
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

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

}
