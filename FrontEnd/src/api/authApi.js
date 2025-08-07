// src/api/authApi.js
import axios from "axios";

// npm install axios 필요

// 회원가입 기능
export const signUp = async (formData) => {
  try {
  const payload = {
    user_id: formData.user_id,
    password: formData.password,
    username: formData.username,
    nickname: formData.nickname,
    phone_number: formData.phone_number,
    naverlogincheck: formData.naverlogincheck || null, // 네이버 신규 가입 시 필수
  };
  const res = await axios.post("http://localhost:8095/zal/api/join", payload);
  return res.data;           // { success, message }
  } catch (err) {
    console.error("회원가입 API 오류", err.response?.data || err.message);
    return { success: false, message: "서버 오류 발생" };
  }
};

// 로그인 기능
export const login = async (loginData) => {
  const res = await axios.post("http://localhost:8095/zal/api/login", loginData,{
  withCredentials: true,
});
  return res.data;          // { success, message, user }
};
