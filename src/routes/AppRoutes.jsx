import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import StaticPage from "../pages/StaticPage";

import AppLayout from "../components/layout/AppLayout";

import LoginPage from "../pages/LoginPages";

import RegisterStudent from "../pages/Student/RegisterStudent";
import StudentList from "../pages/Student/StudentPage";
import CoursesPage from "../pages/Course/CoursePage";
import StudenrtDetail from "../pages/Student/StudentDetail";

import EnrollmentsPage from "../pages/Enrolment/EnrolmentsPage";

import AttendancePage from "../pages/Attendance/AttendancePage";
import AttendanceView from "../pages/Attendance/ViewAttendance";

import MarksPage from "../pages/Marks/MarkList";

import ComplaintsPage from "../pages/Complaint/complaintPage";

import ManagmentPage from "../pages/Managment/ManagmentPage";

import DepartmentPage from "../pages/Department/DepartmentPage";
import UserDepartmentPage from "../pages/Department/UserDepartmentPage";

import LettersPage from "../pages/Letter/LetterPage";
import LetterDetailPage from "../pages/Letter/LetterDetailPage";

import ProtectedRoute from "./ProtectedRoute";

import { AuthContext } from "../contexts/AuthContext";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Dashboard */}
        <Route index element={<HomePage />} />

        {/* Students */}
        <Route
          path="register-student"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RegisterStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="view-students"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StudentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="courses"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="students/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StudenrtDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="enrolments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
              <EnrollmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="take-attendance"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="view-attendance"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}>
              <AttendanceView />
            </ProtectedRoute>
          }
        />

        <Route
          path="marklist"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
              <MarksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="complaints"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="managements"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManagmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="members"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserDepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="letter"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LettersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="letters/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LetterDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Optional Pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="static" element={<StaticPage />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;