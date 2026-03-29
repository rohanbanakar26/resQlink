import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return <section className="page-skeleton">Loading live workspace...</section>;
  }

  if (!currentUser) {
    return <Navigate replace to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate replace to="/emergency" />;
  }

  return children;
}

export default ProtectedRoute;
