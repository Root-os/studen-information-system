import React, { useEffect, useState, useContext } from "react";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import { useToast } from "../../components/ui/toast";

const AttendancePage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [markAll, setMarkAll] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch {
        error("Failed to fetch courses");
      }
    };
    fetchCourses();
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(`/enrollments/by-course/${selectedCourse}`);
        setStudents(res.data.students);

        // Initialize attendance: default PRESENT = false
        const initialAttendance = {};
        res.data.students.forEach((s: { id: string | number }) => {
          initialAttendance[s.id] = false;
        });
        setAttendanceRecords(initialAttendance);
        setMarkAll(false);
      } catch {
        error("Failed to fetch students");
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/users");
        const teacherUsers = res.data.filter(
          (u: { role: string }) => u.role === "TEACHER",
        );
        setTeachers(teacherUsers);
      } catch {
        error("Failed to fetch teachers");
      }
    };

    fetchTeachers();
  }, []);

  // Toggle individual student
  const toggleStudent = (id: string | number) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle mark all
  const toggleMarkAll = () => {
    const newMark = !markAll;
    const updated = {};
    students.forEach((s) => (updated[s.id] = newMark));
    setAttendanceRecords(updated);
    setMarkAll(newMark);
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (!selectedCourse) return error("Select a course");

    const records = Object.entries(attendanceRecords).map(
      ([studentId, present]) => ({
        studentId: parseInt(studentId),
        attendance: present ? "PRESENT" : "ABSENT",
      }),
    );

    try {
      await api.post("/attendance", {
        courseId: selectedCourse,
        date,
        teacherId: parseInt(selectedTeacher),
        records,
      });
      success("Attendance recorded successfully");
    } catch (err) {
      error(err.response?.data?.message || "Failed to save attendance");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <h2 className={`text-2xl font-bold ${theme.text}`}>Take Attendance</h2>

      {/* Course selector */}
      <div className="flex items-center gap-4">
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className={`px-3 py-2 border rounded ${
            currentTheme === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300"
          }`}
        >
          <option value="">Select a teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName} ({t.email})
            </option>
          ))}
        </select>
        <select
          value={selectedCourse || ""}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className={`px-3 py-2 border rounded ${currentTheme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
        >
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.courseName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`px-3 py-2 border rounded ${currentTheme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
        />

        <button
          onClick={toggleMarkAll}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          {markAll ? "Unmark All" : "Mark All PRESENT"}
        </button>
      </div>

      {/* Students list */}
      <div className="mt-4 border rounded p-4 space-y-2 max-w-md">
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={attendanceRecords[s.id] || false}
              onChange={() => toggleStudent(s.id)}
            />
            <span className={theme.text}>
              {s.fullName} ({s.email})
            </span>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className={`${theme.primary} text-white px-6 py-2 rounded mt-4`}
      >
        Submit Attendance
      </button>
    </div>
  );
};

export default AttendancePage;
