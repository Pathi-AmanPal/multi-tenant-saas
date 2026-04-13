import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

// Wrap any route with this to require ADMIN role
// If not logged in → redirect to /login
// If logged in but not admin → redirect to /dashboard
// If admin → render the page normally

export default function AdminRoute({ children }) {
  const { accessToken, user } = useAuthStore();

  // Not logged in at all
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not an admin — send to dashboard
  // Your backend uses lowercase "admin" role string
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin confirmed — render the page
  return children;
}
