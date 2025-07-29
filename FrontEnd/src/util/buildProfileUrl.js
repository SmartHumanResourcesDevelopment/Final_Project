// src/util/buildProfileUrl.js

/**
 * DB에 저장된 "/uploads/…" 또는 기본 "/uploads/default/user.png" 경로에
 * 반드시 "/zal" 컨텍스트를 붙여서 반환합니다.
 *
 * @param {string} path DB에 저장된 상대경로 (예: "/uploads/abc.jpg")
 * @returns {string} "/zal/uploads/abc.jpg" 또는 기본 "/zal/uploads/default/user.png"
 */
export function buildProfileUrl(path) {
  const CONTEXT = "/zal";

  // DB에 path 없으면 기본 이미지
  const p = path && path !== "" 
    ? path 
    : "/uploads/default/user.png";

  // 절대 URL이면 그대로
  if (p.startsWith("http")) {
    return p;
  }
  // 상대경로인 경우 "/zal" 붙여서 리턴
  return `${CONTEXT}${p}`;
}
