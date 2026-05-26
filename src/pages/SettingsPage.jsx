import React, { useContext } from "react";
import ThemeContext from "../components/layout/ThemeContext";

const SettingsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <h1 className={`text-3xl font-bold mb-4 ${theme.text}`}>Settings</h1>
        <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
          Configure your application preferences and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Theme</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Choose your preferred color theme
                </p>
              </div>
              <select
                className={`px-3 py-2 border rounded-md ${
                  currentTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Compact Mode</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Reduce spacing between elements
                </p>
              </div>
              <button className={`w-12 h-6 rounded-full ${theme.primary} relative`}>
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Email Notifications</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Receive updates via email
                </p>
              </div>
              <button className={`w-12 h-6 rounded-full ${theme.primary} relative`}>
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Push Notifications</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Receive browser notifications
                </p>
              </div>
              <button className="w-12 h-6 rounded-full bg-gray-300 relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Privacy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Profile Visibility</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Make profile public or private
                </p>
              </div>
              <select
                className={`px-3 py-2 border rounded-md ${
                  currentTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option>Public</option>
                <option>Friends Only</option>
                <option>Private</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme.text}`}>Activity Status</p>
                <p className={`text-sm ${currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Show when you're online
                </p>
              </div>
              <button className={`w-12 h-6 rounded-full ${theme.primary} relative`}>
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${
            currentTheme === "dark" ? "bg-gray-800" : "bg-white"
          } p-6 rounded-lg shadow`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Account</h3>
          <div className="space-y-4">
            <button
              className={`w-full px-4 py-2 border rounded-md ${theme.border} ${theme.text} hover:${theme.hover} transition-colors`}
            >
              Change Password
            </button>
            <button
              className={`w-full px-4 py-2 border rounded-md ${theme.border} ${theme.text} hover:${theme.hover} transition-colors`}
            >
              Export Data
            </button>
            <button className="w-full px-4 py-2 border rounded-md border-red-300 text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
