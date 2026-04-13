import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

// Wrap any route with this to require login
// If not logged in → redirect to /login
// If logged in → render the page normally

export default function ProtectedRoute({ children }) {
  const { accessToken } = useAuthStore();

  // No token means not logged in — send to login page
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — render the actual page
  return children;
}
