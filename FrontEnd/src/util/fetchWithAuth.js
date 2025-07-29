export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("jwtToken");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  return fetch(url, { ...options, headers });
};

export default fetchWithAuth;
