import React from "react";
import { useTheme } from "../hooks/useTheme";

const StaticPage = () => {
  const { theme, getBackgroundClass, getTextClass, getFormInputClass } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className={`${getBackgroundClass()} p-6 rounded-lg shadow`}>
        <h1 className={`text-3xl font-bold mb-4 ${theme.text}`}>Static Page Demo</h1>
        <p className={getTextClass("text-gray-600", "text-gray-300")}>
          This page demonstrates the easy theme hook. Simple and consistent!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${getBackgroundClass()} p-6 rounded-lg shadow border-l-4 ${theme.primary}`}>
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Total Users</h3>
          <p className={getTextClass("text-gray-600", "text-gray-300")}>1,234 active users</p>
        </div>
        <div className={`${getBackgroundClass()} p-6 rounded-lg shadow border-l-4 ${theme.primary}`}>
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Revenue</h3>
          <p className={getTextClass("text-gray-600", "text-gray-300")}>$45,678 this month</p>
        </div>
        <div className={`${getBackgroundClass()} p-6 rounded-lg shadow border-l-4 ${theme.primary}`}>
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>Projects</h3>
          <p className={getTextClass("text-gray-600", "text-gray-300")}>89 active projects</p>
        </div>
      </div>

      {/* Form Section */}
      <div className={`${getBackgroundClass()} p-6 rounded-lg shadow`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Contact Form</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className={`w-full px-3 py-2 border rounded-md ${getFormInputClass()}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-3 py-2 border rounded-md ${getFormInputClass()}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Message</label>
            <textarea
              rows="4"
              placeholder="Enter your message"
              className={`w-full px-3 py-2 border rounded-md ${getFormInputClass()}`}
            />
          </div>
          <button className={`px-4 py-2 rounded-md ${theme.primary} text-white hover:opacity-90 transition-opacity`}>
            Send Message
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={`${getBackgroundClass()} p-6 rounded-lg shadow`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className={`text-left p-3 ${theme.text}`}>User</th>
                <th className={`text-left p-3 ${theme.text}`}>Action</th>
                <th className={`text-left p-3 ${theme.text}`}>Time</th>
                <th className={`text-left p-3 ${theme.text}`}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className={`p-3 ${theme.text}`}>John Doe</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>Created project</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>2 hours ago</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className={`p-3 ${theme.text}`}>Jane Smith</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>Updated profile</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>5 hours ago</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className={`p-3 ${theme.text}`}>Bob Johnson</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>Deleted account</td>
                <td className={getTextClass("text-gray-600", "text-gray-300")}>1 day ago</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Inactive
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Section */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Information</h3>
        <p className="text-blue-800">
          This page uses the useTheme hook for easy theme management. Just import useTheme and use the helper functions!
        </p>
      </div>
    </div>
  );
};

export default StaticPage;