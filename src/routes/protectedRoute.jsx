import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, permissionKey, allowedRoles }) => {
  const { isAuthenticated, hasModuleAccess, hasRole } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role bypass: if user's role is in allowedRoles, skip permission check entirely
  if (allowedRoles?.some((r) => hasRole(r))) {
    return children;
  }

  if (permissionKey && !hasModuleAccess(permissionKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
