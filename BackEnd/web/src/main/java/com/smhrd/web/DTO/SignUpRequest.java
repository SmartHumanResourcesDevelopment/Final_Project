package com.smhrd.web.DTO;

public class SignUpRequest {
    private String id;     // 로그인용 아이디
    private String name;   // 이름
    private String password;   // 비밀번호
    private String phone;  // 전화번호
    private String nickname;     // 닉네임
    private String role;       // 관리자 or 사용자

    // 기본 생성자
    public SignUpRequest() {}

    // getter / setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
        
}
