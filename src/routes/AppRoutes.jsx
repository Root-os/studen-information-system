import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import StaticPage from "../pages/StaticPage";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/LoginPages";
import RegisterStudent from "../pages/Student/RegisterStudent";
import StudentList from "../pages/Student/StudentPage"
import CoursesPage from "../pages/Course/CoursePage";
import StudenrtDetail from "../pages/Student/StudentDetail";
import EnrollmentsPage from "../pages/Enrolment/EnrolmentsPage";
import AttendancePage from "../pages/Attendance/AttendancePage";
import AttendanceView from "../pages/Attendance/ViewAttendance";
import MarksPage from "../pages/Marks/MarkList";
import ComplaintsPage from "../pages/Complaint/complaintPage"
import ManagmentPage from "../pages/Managment/ManagmentPage"
import DepartmentPage from "../pages/Department/DepartmentPage"
import UserDepartmentPage from "../pages/Department/UserDepartmentPage"
import LettersPage from "../pages/Letter/LetterPage"
import LetterDetailPage from "../pages/Letter/LetterDetailPage";


import { AuthContext } from "../contexts/AuthContext";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />

      {/* Private routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register-student" element={<RegisterStudent />} />
                <Route path="/view-students" element={<StudentList />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/students/:id" element={<StudenrtDetail />} />
                <Route path="/enrolments" element={<EnrollmentsPage/>}/>
                <Route path="/take-attendance" element={<AttendancePage/>}/>
                <Route path="/view-attendance" element={<AttendanceView/>}/>
                <Route path="/marklist" element={<MarksPage/>}/>
                <Route path="/complaints" element={<ComplaintsPage/>}/>
                <Route path="/managements" element={<ManagmentPage/>}/>
                <Route path="/departments" element={<DepartmentPage/>}/>
                <Route path="/members" element={<UserDepartmentPage/>}/>
                <Route path="/letter" element={<LettersPage/>}/>
                <Route path="/letters/:id" element={<LetterDetailPage />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;