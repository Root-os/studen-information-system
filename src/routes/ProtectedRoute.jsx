import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, permissionKey, allowedRoles }) => {
  const { isAuthenticated, hasModuleAccess, hasRole } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role bypass: if allowedRoles is specified and user's role matches, grant access immediately
  if (allowedRoles?.length > 0) {
    if (allowedRoles.some((r) => hasRole(r))) {
      return children;
    }
    // allowedRoles specified but user's role doesn't match → deny
    // Fall through to permissionKey check (if provided) before rejecting
    if (!permissionKey) {
      return <Navigate to="/" replace />;
    }
  }

  if (permissionKey && !hasModuleAccess(permissionKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
