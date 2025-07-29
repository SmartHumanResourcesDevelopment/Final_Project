// src/util/buildProfileUrl.js

/**
 * DB에 저장된 "/uploads/…" 또는 "/img/default/user.png" 경로를
 * (vite proxy 설정에 따라) 그대로 반환합니다.
 *
 * @param {string} path
 * @returns {string}
 */
export function buildProfileUrl(path) {
  // path가 없으면 기본 이미지로
  if (!path) {
    return "/uploads/default/user.png";
  }
  // 이미 http://… 라면 그대로, 아니면 상대경로를 그대로
  if (path.startsWith("http")) {
    return path;
  }
  return path;
}
