import axios from "axios";

// API 기본 설정
const BASE_URL = "http://localhost:8095/zal/api/keyword";

// axios 인스턴스 생성
const subApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (로깅)
subApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ API 요청 오류:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (로깅)
subApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API 응답 오류: ${error.config?.url} - ${error.response?.status}`);
    return Promise.reject(error);
  }
);

// 키워드 검색 API 서비스
export const keywordApiService = {
  
  /**
   * 키워드 상세 정보 검색
   * @param {string} keyword - 검색할 키워드명
   * @returns {Promise<Object>} 키워드 상세 정보
   */
  searchKeyword: async (keyword) => {
    try {
      console.log("🔍 키워드 검색 요청:", keyword);
      
      const response = await subApi.get("/search", {
        params: { keyword: keyword.trim() }
      });
      
      console.log("✅ 키워드 검색 성공:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ 키워드 검색 실패:", error);
      
      // 에러 타입별 처리
      if (error.response?.status === 404) {
        throw new Error("검색된 키워드가 없습니다.");
      } else if (error.response?.status === 500) {
        throw new Error("서버 오류가 발생했습니다.");
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("요청 시간이 초과되었습니다.");
      } else {
        throw new Error("검색 중 오류가 발생했습니다.");
      }
    }
  },

  /**
   * 키워드 자동완성 검색
   * @param {string} query - 검색 쿼리
   * @returns {Promise<Object>} 자동완성 키워드 목록
   */
  getAutocomplete: async (query) => {
    try {
      console.log("🔍 자동완성 요청:", query);
      
      if (!query || query.trim().length < 1) {
        return { keywords: [], count: 0 };
      }
      
      const response = await subApi.get("/autocomplete", {
        params: { q: query.trim() }
      });
      
      console.log("✅ 자동완성 성공:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ 자동완성 실패:", error);
      return { keywords: [], count: 0 };
    }
  },

  /**
   * 인기 키워드 목록 조회
   * @returns {Promise<Object>} 인기 키워드 목록
   */
  getPopularKeywords: async () => {
    try {
      console.log("🔍 인기 키워드 요청");
      
      const response = await subApi.get("/popular");
      
      console.log("✅ 인기 키워드 성공:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ 인기 키워드 실패:", error);
      
      // 기본 인기 키워드 반환
      return {
        keywords: [
          { KEYWORD_NAME: "마라탕" },
          { KEYWORD_NAME: "민트초코" },
          { KEYWORD_NAME: "말차" },
          { KEYWORD_NAME: "탕후루" },
          { KEYWORD_NAME: "치킨" }
        ],
        count: 5
      };
    }
  },

  /**
   * 키워드 통계 데이터 조회
   * @param {number} keywordId - 키워드 ID
   * @returns {Promise<Object>} 키워드 통계 데이터
   */
  getKeywordStats: async (keywordId) => {
    try {
      console.log("🔍 키워드 통계 요청:", keywordId);
      
      const response = await subApi.get(`/stats/${keywordId}`);
      
      console.log("✅ 키워드 통계 성공:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ 키워드 통계 실패:", error);
      throw new Error("통계 데이터를 불러올 수 없습니다.");
    }
  },

  /**
   * 유사 키워드 정보 조회
   * @param {number} keywordId - 키워드 ID
   * @returns {Promise<Object>} 유사 키워드 정보
   */
  getSimilarKeywords: async (keywordId) => {
    try {
      console.log("🔍 유사 키워드 요청:", keywordId);

      const response = await subApi.get(`/similar/${keywordId}`);

      console.log("✅ 유사 키워드 성공:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ 유사 키워드 실패:", error);
      return { similarKeywords: [], reason: "유사 키워드 정보가 없습니다." };
    }
  },

  /**
   * 키워드 일별 통계 조회
   * @param {string} keyword - 키워드명
   * @param {string} period - 조회 기간 (1일, 1주, 1달, 1년)
   * @returns {Promise<Object>} 일별 통계 데이터
   */
  getDailyStats: async (keyword, period = "1주") => {
    try {
      console.log("📊 일별 통계 요청:", keyword, period);

      const response = await subApi.get("/daily-stats", {
        params: {
          keyword: keyword.trim(),
          period: period
        }
      });

      console.log("✅ 일별 통계 성공:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ 일별 통계 실패:", error);
      throw new Error("일별 통계 데이터를 불러올 수 없습니다.");
    }
  }
};

// 기본 export
export default keywordApiService;
