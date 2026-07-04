import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AuthContext } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import api from "../hooks/api";

const LoginPage = () => {
  const [loginType, setLoginType] = useState("user");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let response;

      if (loginType === "user") {
        response = await api.post("/auth/login", {
          email: identifier,
          password,
        });
      } else if (loginType === "teacher") {
        response = await api.post("/teacher/login", {
          userName: identifier,
          password,
        });
      } else if (loginType === "staff") {
        response = await api.post("/staff/login", {
          userName: identifier,
          password,
        });
      }

      const { token } = response.data;

      // 🔥 decode token = full user
      const decoded = jwtDecode(token);

      // 🔥 IMPORTANT FIX HERE
      login(token, decoded);

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Login Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login As
            </label>

            <select
              value={loginType}
              onChange={(e) => {
                setLoginType(e.target.value);
                setIdentifier("");
              }}
              className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Email / Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {loginType === "user" ? "Email" : "Username"}
            </label>

            <input
              type={loginType === "user" ? "email" : "text"}
              placeholder={
                loginType === "user"
                  ? "Enter your email"
                  : "Enter your username"
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Forgot your password?{" "}
          <span className="text-blue-600 underline cursor-pointer">Reset</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
