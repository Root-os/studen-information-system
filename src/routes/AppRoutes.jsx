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
import EditStudent from "../pages/Student/EditStudent";

import EnrollmentsPage from "../pages/Enrolment/EnrolmentsPage";

import AttendancePage from "../pages/Attendance/AttendancePage";
import AttendanceView from "../pages/Attendance/ViewAttendance";

// import MarksPage from "../pages/Marks/MarkList";

import ComplaintsPage from "../pages/Complaint/complaintPage";

import ManagmentPage from "../pages/Managment/ManagmentPage";

import DepartmentPage from "../pages/Department/DepartmentPage";
import UserDepartmentPage from "../pages/Department/UserDepartmentPage";

import LettersPage from "../pages/Letter/LetterPage";
import LetterDetailPage from "../pages/Letter/LetterDetailPage";
import CourseAssignmentPage from "../pages/CourseAssign/CourseAssignmentPage";

import RolePage from "../pages/Role/RolePage";
import StaffPage from "../pages/Staff/Staffpage";
import RolePermissionPage from "../pages/RolePermission/RolePermissionPage";
import AssignUserPage from "../pages/AssignUser/assignUser";
import TeachersPage from "../pages/Teacher/TeachersPage";
import ClassesPage from "../pages/Class/ClassPage";
import ProtectedRoute from "./ProtectedRoute";
import MarkListPage from "../pages/Marks/MarkListPage";
import ViewMarkList from "../pages/Marks/ViewMarkList";
import BlogPage from "../pages/Blog/BlogPage";
import PermissionsPage from "../pages/Permission/PermissionsPage";

import { AuthContext } from "../contexts/AuthContext";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
        }
      >
        {/* Dashboard */}
        <Route index element={<HomePage />} />

        {/* Students */}
        <Route
          path="register-student"
          element={
            <ProtectedRoute permissionKey="students">
              <RegisterStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="view-students"
          element={
            <ProtectedRoute permissionKey="students">
              <StudentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="teachers"
          element={
            <ProtectedRoute permissionKey="teachers">
              <TeachersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="classes"
          element={
            <ProtectedRoute permissionKey="classes">
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="courses"
          element={
            <ProtectedRoute permissionKey="courses">
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="courseAssignment"
          element={
            <ProtectedRoute permissionKey="course-assignments">
              <CourseAssignmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="students/:id"
          element={
            <ProtectedRoute permissionKey="students">
              <StudenrtDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/edit/:id"
          element={
            <ProtectedRoute permissionKey="students">
              <EditStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="enrolments"
          element={
            <ProtectedRoute permissionKey="enrolments">
              <EnrollmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="take-attendance"
          element={
            <ProtectedRoute permissionKey="attendance" allowedRoles={["Teacher"]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="view-attendance"
          element={
            <ProtectedRoute permissionKey="attendance" allowedRoles={["Teacher"]}>
              <AttendanceView />
            </ProtectedRoute>
          }
        />

        <Route
          path="fill-marks"
          element={
            <ProtectedRoute permissionKey="marklist" allowedRoles={["Teacher"]}>
              <MarkListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="view-marks"
          element={
            <ProtectedRoute permissionKey="marklist" allowedRoles={["Teacher"]}>
              <ViewMarkList />
            </ProtectedRoute>
          }
        />

        <Route
          path="complaints"
          element={
            <ProtectedRoute permissionKey="complaints" allowedRoles={["Teacher", "Student"]}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="managements"
          element={
            <ProtectedRoute permissionKey="managment">
              <ManagmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="departments"
          element={
            <ProtectedRoute permissionKey="departments">
              <DepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="members"
          element={
            <ProtectedRoute permissionKey="members">
              <UserDepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="letter"
          element={
            <ProtectedRoute permissionKey="letter">
              <LettersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="letters/:id"
          element={
            <ProtectedRoute permissionKey="letter">
              <LetterDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="roles"
          element={
            <ProtectedRoute permissionKey="roles">
              <RolePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="staffs"
          element={
            <ProtectedRoute permissionKey="staff">
              <StaffPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="rolepermissions"
          element={
            <ProtectedRoute permissionKey="role permission">
              <RolePermissionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="assignusers"
          element={
            <ProtectedRoute permissionKey="assign user">
              <AssignUserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="blog"
          element={
            <ProtectedRoute permissionKey="blog">
              <BlogPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="permissions"
          element={
            <ProtectedRoute permissionKey="permissions">
              <PermissionsPage />
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
