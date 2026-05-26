import React, { useContext } from "react";
import ThemeContext from "../components/layout/ThemeContext";

const ProfilePage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <h1 className={`text-3xl font-bold mb-4 ${theme.text}`}>Profile</h1>
        <p className={currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div
            className={`${
              currentTheme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg shadow`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full ${theme.primary} flex items-center justify-center mb-4`}>
                <span className="text-white text-3xl font-bold">JD</span>
              </div>
              <h3 className={`text-xl font-semibold ${theme.text}`}>John Doe</h3>
              <p className={currentTheme === "dark" ? "text-gray-400" : "text-gray-500"}>
                john.doe@example.com
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div
            className={`${
              currentTheme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg shadow`}
          >
            <h3 className={`text-xl font-semibold mb-4 ${theme.text}`}>Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className={`w-full px-3 py-2 border rounded-md ${
                    currentTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className={`w-full px-3 py-2 border rounded-md ${
                    currentTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                  Bio
                </label>
                <textarea
                  rows="4"
                  defaultValue="Frontend developer passionate about creating beautiful user interfaces."
                  className={`w-full px-3 py-2 border rounded-md ${
                    currentTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <button className={`px-4 py-2 rounded-md ${theme.primary} text-white hover:opacity-90 transition-opacity`}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
