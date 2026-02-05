import { Navigate } from "react-router-dom";

/**
 * @param {ReactNode} children - component to render
 * @param {string} role - optional role ("admin")
 */
export default function ProtectedRoute({ children, role }) {
  const userId = sessionStorage.getItem("userId");
  const userRole = sessionStorage.getItem("role");

  // ❌ Not logged in
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  // ❌ Logged in but not admin
  if (role && userRole !== role) {
    return <Navigate to="/home" replace />;
  }

  // ✅ Allowed
  return children;
}
