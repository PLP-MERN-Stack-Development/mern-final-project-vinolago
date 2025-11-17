// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";

export default function ProtectedRoute({ children, adminOnly = false, requireVerification = false }) {
  const { isAuthenticated, loading, isAdmin, isVerified } = useAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <NotFound />;
  }

  if (requireVerification && !isVerified) {
    return <Navigate to="/verify-profile" replace />;
  }

  return children;
}
