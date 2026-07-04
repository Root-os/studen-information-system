import React, { createContext, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("authToken") || null
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("authUser")) || null
  );

  // 🔐 LOGIN
  const login = (newToken, userData) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  };

  // ⭐ ADD THIS: Super Admin check
  const isSuperAdmin = () => {
    return user?.role?.name === "Super Admin";
  };

  // ⭐ ADD THIS: Permission check
  const hasPermission = (key) => {
    if (!user) return false;

    // Super Admin bypass everything
    if (isSuperAdmin()) return true;

    return user?.permissions?.[key]?.view === true;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,

        // ⭐ ADD THESE EXPORTS
        isSuperAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};