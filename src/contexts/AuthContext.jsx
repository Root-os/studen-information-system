import React, { createContext, useState,  } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);

  const login = (newToken) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};