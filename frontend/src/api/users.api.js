import api from "./axios"; // our custom instance — auto-attaches headers

// Get all users in the tenant (admin + user can call this)
export async function getUsersRequest() {
  const res = await api.get("/api/users");
  return res.data; // { success, data: [...users] }
}

// Create a new user — ADMIN only
export async function createUserRequest(userData) {
  // userData = { name, email, password, role }
  const res = await api.post("/api/users", userData);
  return res.data; // { success, data: user }
}