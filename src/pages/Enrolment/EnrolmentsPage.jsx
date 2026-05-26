import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";

const EnrollmentsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
  });

  // Fetch enrollments, students, and courses
  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data);
    } catch {
      error("Failed to fetch enrollments");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/users"); // fetch users with student role
      setStudents(res.data.filter((u) => u.role === "STUDENT"));
    } catch {
      error("Failed to fetch students");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch {
      error("Failed to fetch courses");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEnrollment) {
        await api.put(`/enrollments/${editingEnrollment.id}`, formData);
        success("Enrollment updated successfully");
      } else {
        await api.post("/enrollments", formData);
        success("Enrollment created successfully");
      }

      setShowModal(false);
      setEditingEnrollment(null);
      setFormData({ studentId: "", courseId: "" });
      fetchEnrollments();
    } catch {
      error("Something went wrong");
    }
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setFormData({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enrollments/${confirmDelete}`);
      success("Enrollment deleted successfully");
      setConfirmDelete(null);
      fetchEnrollments();
    } catch {
      error("Failed to delete enrollment");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (row, index) =>
        (index + 1) + (10 * ((row.page || 1) - 1)), // adjust if paginated
    },
    { header: "Student Name", accessor: "studentName", render: (row) => row.student.fullName },
    { header: "Student Email", accessor: "studentEmail", render: (row) => row.student.email },
    { header: "Course Name", accessor: "courseName", render: (row) => row.course.courseName },
    { header: "Course Code", accessor: "courseCode", render: (row) => row.course.courseCode },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-md hover:bg-blue-100 text-blue-500"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={() => setConfirmDelete(row.id)}
            className="p-2 rounded-md hover:bg-red-100 text-red-500"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const modalBg = currentTheme === "dark" ? "bg-gray-900" : "bg-white";
  const modalText = theme.text;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg shadow flex justify-between ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${modalText}`}>Enrollments</h2>
        <button
          onClick={() => {
            setEditingEnrollment(null);
            setShowModal(true);
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Add Enrollment
        </button>
      </div>

      {/* Table */}
      <div className={`p-6 rounded-lg shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={enrollments} />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.email})
                  </option>
                ))}
              </select>

              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`${currentTheme === "dark" ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"} px-3 py-2 border rounded`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`${theme.primary} text-white px-4 py-2 rounded`}
                >
                  {editingEnrollment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[350px]`}>
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>Delete Enrollment</h3>
            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this enrollment?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`${currentTheme === "dark" ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"} px-3 py-2 border rounded`}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsPage;