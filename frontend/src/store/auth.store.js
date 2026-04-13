import { create } from "zustand";

const useAuthStore = create((set) => ({
  // --- State ---
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: null,
  tenant: null,

  // --- Actions ---

  setTokens: (accessToken, refreshToken, user, tenant) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tenantUUID", tenant.uuid);

    set({
      accessToken,
      refreshToken,
      user,
      tenant,
    });
  },

  setAccessToken: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ accessToken });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tenantUUID");

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
    });
  },

  // 🔥 FIXED REHYDRATE
  rehydrate: () => {
    const accessToken = localStorage.getItem("accessToken");
    const tenantUUID = localStorage.getItem("tenantUUID");

    if (!accessToken || !tenantUUID) return;

    set({
      accessToken,
      tenant: { uuid: tenantUUID },

      // 🔥 TEMP fallback (until you fetch user profile API later)
      user: null,
    });
  },
}));

export default useAuthStore;
