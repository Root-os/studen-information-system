import React, { useState } from "react";
import AppSidebar from "./Sidebar";
import Header from "./Header";
import { useContext } from "react";
import ThemeContext from "./ThemeContext";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useContext(ThemeContext);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div
      className={`flex min-h-screen ${theme.secondary} transition-colors duration-300`}
    >
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64 ml-0" : "md:ml-16 ml-0"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
