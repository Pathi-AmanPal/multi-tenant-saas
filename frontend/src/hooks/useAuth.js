import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";
import { loginRequest, logoutRequest } from "../api/auth.api";

export function useAuth() {
  const navigate = useNavigate();

  const { user, accessToken, refreshToken, setTokens, clearAuth } =
    useAuthStore();

  // LOGIN
  async function login(tenantUUID, email, password) {
    try {
      const data = await loginRequest(tenantUUID, email, password);

      setTokens(data.accessToken, data.refreshToken, data.user, data.tenant);

      if (data.user.role === "admin") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      throw err.response?.data?.message || "Login failed";
    }
  }

  // LOGOUT
  async function logout() {
    try {
      const tenantUUID = localStorage.getItem("tenantUUID");
      await logoutRequest(refreshToken, tenantUUID);
    } catch {
      // ignore
    } finally {
      clearAuth();
      localStorage.removeItem("tenantUUID");
      navigate("/login");
    }
  }

  return {
    user,
    accessToken,
    isLoggedIn: !!accessToken,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };
}
