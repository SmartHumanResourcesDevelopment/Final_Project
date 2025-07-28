/**
 * JWT가 필요한 API 요청을 편리하게 해주는 유틸 함수
 * @param {string} url - 요청할 API 주소 (예: "/api/mypage")
 * @param {object} options - fetch의 옵션(메서드, 바디 등)
 * @returns {Promise<Response>} fetch의 원본 Response 객체를 반환
 */
export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("jwtToken");
  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return fetch(url, { ...options, headers });
};
