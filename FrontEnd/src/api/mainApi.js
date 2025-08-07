// src/api/mainApi.js
import axios from "axios";

// 기본 API URL 설정
const BASE_URL = "http://localhost:8095/zal/api/main";

// axios 인스턴스 생성
const mainApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 (로깅용)
mainApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ API 요청 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
mainApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API 응답 에러: ${error.config?.url} - ${error.response?.status}`);
    return Promise.reject(error);
  }
);

// 메인 페이지 API 함수들
export const mainApiService = {
  
  // 1. 랭킹 데이터 조회
  getRanking: async (period = "1일") => {
    try {
      const response = await mainApi.get(`/ranking?period=${encodeURIComponent(period)}`);
      return response.data;
    } catch (error) {
      console.error("랭킹 데이터 조회 실패:", error);
      throw error;
    }
  },

  // 2. TOP3 키워드 조회
  getTop3Keywords: async () => {
    try {
      console.log("🔍 TOP3 키워드 API 호출");
      const response = await mainApi.get("/top3");
      console.log("✅ TOP3 키워드 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ TOP3 키워드 조회 실패:", error);
      throw error;
    }
  },

  // 3. 급상승 키워드 조회
  getTrendingKeywords: async () => {
    try {
      const response = await mainApi.get("/trending");
      return response.data;
    } catch (error) {
      console.error("급상승 키워드 조회 실패:", error);
      throw error;
    }
  },

  // 4. TOP3 인사이트 차트 데이터
  getTop3Insights: async (period = "월") => {
    try {
      console.log("📊 TOP3 인사이트 API 호출 - 기간:", period);
      const response = await mainApi.get("/top3/insights", {
        params: { period }
      });
      console.log("✅ TOP3 인사이트 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ TOP3 인사이트 조회 실패:", error);
      throw error;
    }
  },

  // 5. 급상승 인사이트 차트 데이터
  getTrendingInsights: async () => {
    try {
      const response = await mainApi.get("/trending/insights");
      return response.data;
    } catch (error) {
      console.error("급상승 인사이트 조회 실패:", error);
      throw error;
    }
  },

  // 6. 검색 자동완성
  getSearchSuggestions: async (query) => {
    try {
      const response = await mainApi.get(`/search/suggestions?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("검색 자동완성 조회 실패:", error);
      throw error;
    }
  },

  // 7. 통계 요약
  getStatsSummary: async () => {
    try {
      const response = await mainApi.get("/stats/summary");
      return response.data;
    } catch (error) {
      console.error("통계 요약 조회 실패:", error);
      throw error;
    }
  },

  // 8. CORS 테스트용
  test: async () => {
    try {
      const response = await mainApi.get("/test");
      return response.data;
    } catch (error) {
      console.error("테스트 API 호출 실패:", error);
      throw error;
    }
  }
};

export default mainApiService;
