import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return <section className="panel">Loading...</section>;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
