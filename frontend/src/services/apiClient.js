/**
 * Unified API Client for ChurnWise PRO
 * Connects frontend to backend REST API via /api proxy (http://localhost:5000)
 */

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = localStorage.getItem("churnwise_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    // If backend is unreachable or network error, log and rethrow
    console.warn(`[API Client] ${options.method || "GET"} ${url} error:`, err.message);
    throw err;
  }
}

export const api = {
  get: (endpoint, headers) => request(endpoint, { method: "GET", headers }),
  post: (endpoint, body, headers) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers
    }),
  put: (endpoint, body, headers) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers
    }),
  delete: (endpoint, headers) => request(endpoint, { method: "DELETE", headers })
};

export default api;
