import React, { createContext, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a context for toast
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const info = (message) => toast.info(message);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </ToastContext.Provider>
  );
};