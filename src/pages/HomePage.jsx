import React, { useContext } from "react";
import ThemeContext from "../components/layout/ThemeContext";

const HomePage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>Welcome Home</h1>
        <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
          This is your home dashboard. Navigate through the sidebar to explore different pages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow border-l-4 ${theme.primary}`}
        >
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Quick Stats</h3>
          <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
            View your important metrics and analytics here.
          </p>
        </div>
        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow border-l-4 ${theme.primary}`}
        >
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Recent Activity</h3>
          <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Check your latest updates and notifications.
          </p>
        </div>
        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow border-l-4 ${theme.primary}`}
        >
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Tasks</h3>
          <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Manage your to-do items and projects.
          </p>
        </div>
        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow border-l-4 ${theme.primary}`}
        >
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Settings</h3>
          <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Customize your preferences and account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
