import { Navigate } from "react-router-dom";
import { getSession } from "../../services/session.js";

export default function ProtectedRoute({ roles, children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.user.roleKey)) {
    return <Navigate to={session.user.home} replace />;
  }
  return children;
}