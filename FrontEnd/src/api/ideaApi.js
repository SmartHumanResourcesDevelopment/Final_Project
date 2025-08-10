// src/api/aiIdeaApi.js
import axios from "axios";

// 공통 설정
const API_BASE = "http://localhost:8095/zal/api/chatbot";



// 제품 아이디어 저장
export const ProductIdeas = async (ideaData) => {
  try {
    const payload = {
      user_id: ideaData.user_id,
      product_idea: ideaData.product_idea
    };
    const res = await axios.post(`${API_BASE}/productIdeas`, payload, {
      withCredentials: true
    });
    return res.data; // { success, message }
  } catch (err) {
    console.error("제품 아이디어 저장 API 오류", err.response?.data || err.message);
    return { success: false, message: "서버 오류 발생" };
  }
};

// 콜라보 아이디어 저장
export const CollabIdeas = async (collabData) => {
  try {
    const payload = {
      user_id: collabData.user_id,
      collab_idea: collabData.collab_idea
    };
    const res = await axios.post(`${API_BASE}/collabIdeas`, payload, {
      withCredentials: true
    });
    return res.data; // { success, message }
  } catch (err) {
    console.error("콜라보 아이디어 저장 API 오류", err.response?.data || err.message);
    return { success: false, message: "서버 오류 발생" };
  }
};

// 슬로건 저장
export const Slogans = async (sloganData) => {
  try {
    const payload = {
      user_id: sloganData.user_id,
      slogan: sloganData.slogan
    };
    const res = await axios.post(`${API_BASE}/slogans`, payload, {
      withCredentials: true
    });
    return res.data; // { success, message }
  } catch (err) {
    console.error("슬로건 저장 API 오류", err.response?.data || err.message);
    return { success: false, message: "서버 오류 발생" };
  }
};
