// src/api/authApi.js
import axios from "axios";

export const signUp = async (data) => {
  const res = await axios.post("http://localhost:8080/api/join", data);
  return res.data;           // { success, message }
};
