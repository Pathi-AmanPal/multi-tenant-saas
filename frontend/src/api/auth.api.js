import axios from "axios";
import { BASE_URL } from "../utils/constants";

export async function loginRequest(tenantUUID, email, password) {
  const res = await axios.post(
    `${BASE_URL}/api/auth/login`,
    { email, password },
    { headers: { "x-tenant-id": tenantUUID } },
  );

  return res.data; // let store handle storage
}

export async function logoutRequest(refreshToken, tenantUUID) {
  const accessToken = localStorage.getItem("accessToken");

  const res = await axios.post(
    `${BASE_URL}/api/auth/logout`,
    { refreshToken },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-tenant-id": tenantUUID,
      },
    },
  );

  return res.data;
}
