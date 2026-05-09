import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/auth" replace />;
  if (roles && !roles.some((role) => auth.roles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
