// src/api/authApi.js
import axios from "axios";

// npm install axios 필요

// 회원가입 기능
export const signUp = async (formData) => {
  const res = await axios.post("http://localhost:8095/zal/api/join", formData);
  return res.data;           // { success, message }
};

// 로그인 기능
export const login = async (loginData) => {
  const res = await axios.post("http://localhost:8095/zal/api/login", loginData,{
  withCredentials: true,
});
  return res.data;          // { success, message, user }
};
