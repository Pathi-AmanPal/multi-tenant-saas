import axios from "axios";
import { BASE_URL } from "../utils/constants";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// ======================
// REQUEST INTERCEPTOR
// ======================
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  const tenantUUID = localStorage.getItem("tenantUUID");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (tenantUUID) {
    config.headers["x-tenant-id"] = tenantUUID;
  }

  return config;
});

// ======================
// RESPONSE INTERCEPTOR
// ======================
let isRefreshing = false;
let failedQueue = [];

// Process queued requests
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      const tenantUUID = localStorage.getItem("tenantUUID");

      if (!refreshToken || !tenantUUID) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { "x-tenant-id": tenantUUID } }
        );

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          tenant,
        } = res.data;

        // Store updated tokens
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 🔥 Update tenant UUID (important)
        if (tenant?.uuid) {
          localStorage.setItem("tenantUUID", tenant.uuid);
        }

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;