// src/api/authApi.js
import axios from "axios";

// npm install axios 필요
export const signUp = async (data) => {
  const res = await axios.post("http://localhost:8080/zal/api/join", data);
  return res.data;           // { success, message }
};
