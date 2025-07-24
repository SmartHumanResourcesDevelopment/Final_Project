package com.smhrd.web.DTO;

public class SignUpResponse {
    private boolean success;
    private String message;

    // 기본 생성자
     public SignUpResponse() {}
    
    // 생성자
    public SignUpResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
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

}
