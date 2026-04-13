import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AdminRoute from "../components/guards/AdminRoute";

// Pages — we'll create these next
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminTenant from "../pages/admin/AdminTenant";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route — redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PUBLIC — no auth needed */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED — must be logged in (any role) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY — must be logged in AND role === "admin" */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tenant"
          element={
            <AdminRoute>
              <AdminTenant />
            </AdminRoute>
          }
        />

        {/* Catch-all — any unknown route goes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
