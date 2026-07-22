import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("authToken") || null
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 🔐 LOGIN
  const login = (newToken, userData) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);

    if (userData) {
      localStorage.setItem("authUser", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  };

  const isSuperAdmin = () => {
    return user?.role?.name === "Super Admin";
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return user?.permissions?.[module]?.[action] === true;
  };

  const hasModuleAccess = (module) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    const permissions = user?.permissions?.[module];
    if (!permissions) return false;
    return Object.values(permissions).some(Boolean);
  };

  // Check if the logged-in user has a specific role by name.
  // user.role is decoded from JWT as { id, name } — so we compare role.name directly.
  const hasRole = (roleName) => {
    if (!user) return false;
    return user?.role?.name?.toLowerCase() === roleName.toLowerCase();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,

        // helpers
        isSuperAdmin,
        hasPermission,
        hasModuleAccess,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
