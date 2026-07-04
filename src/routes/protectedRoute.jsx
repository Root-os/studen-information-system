import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, permissionKey }) => {
  const {
    isAuthenticated,
    hasModuleAccess,
  } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permissionKey && !hasModuleAccess(permissionKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;