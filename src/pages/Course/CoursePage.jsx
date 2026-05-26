import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast"; 

const CoursesPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast(); 
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    grade: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

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
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        success("Course updated successfully");
      } else {
        await api.post("/courses", formData);
        success("Course created successfully");
      }

      setShowModal(false);
      setEditingCourse(null);
      setFormData({ courseName: "", courseCode: "", grade: "" });
      fetchCourses();
    } catch {
      error("Something went wrong");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      grade: course.grade,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${confirmDelete}`);
      success("Course deleted successfully");
      setConfirmDelete(null);
      fetchCourses();
    } catch {
      error("Failed to delete course");
    }
  };

 
 const columns = [
  {
    header: "No.",
    accessor: "rowNumber",
    render: (row, index) => index + 1, // index will come from map
  },
  { header: "Course Name", accessor: "courseName" },
  { header: "Course Code", accessor: "courseCode" },
  { header: "Grade", accessor: "grade" },
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
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow flex justify-between`}
      >
        <h2 className={`text-xl font-bold ${modalText}`}>Courses</h2>

        <button
          onClick={() => {
            setEditingCourse(null);
            setShowModal(true);
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Add Course
        </button>
      </div>

      {/* Table */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <DataTable columns={columns} data={courses} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingCourse ? "Edit Course" : "Add Course"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Course Name"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
              />
              <input
                placeholder="Course Code"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
              />
              <input
                placeholder="Grade"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
              />

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
                  {editingCourse ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[350px]`}>
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>
              Delete Course
            </h3>

            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this course?
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

export default CoursesPage;