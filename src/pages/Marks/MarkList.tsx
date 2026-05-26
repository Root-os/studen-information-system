import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";

const MarksPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    teacherId: "",
    mark: "",
  });

  useEffect(() => {
    fetchMarks();
    fetchDropdownData();
  }, []);

  const fetchMarks = async () => {
    try {
      const res = await api.get("/marks");
      setMarks(res.data);
    } catch {
      error("Failed to fetch marks");
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        api.get("/users"),
        api.get("/users?role=TEACHER"),
        api.get("/courses"),
      ]);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setCourses(coursesRes.data);
    } catch {
      error("Failed to fetch dropdown data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMark) {
        // Update existing mark
        await api.put(`/marks/${editingMark.id}`, {
          studentId: Number(formData.studentId),
          courseId: Number(formData.courseId),
          teacherId: Number(formData.teacherId),
          mark: Number(formData.mark),
        });
        success("Mark updated successfully");
      } else {
        // Create new mark
        await api.post("/marks", {
          studentId: Number(formData.studentId),
          courseId: Number(formData.courseId),
          teacherId: Number(formData.teacherId),
          mark: Number(formData.mark),
        });
        success("Mark added successfully");
      }

      setShowModal(false);
      setEditingMark(null);
      setFormData({ studentId: "", courseId: "", teacherId: "", mark: "" });
      fetchMarks();
    } catch {
      error("Failed to save mark");
    }
  };

  const handleEdit = (mark) => {
    setEditingMark(mark);
    setFormData({
      studentId: mark.studentId,
      courseId: mark.courseId,
      teacherId: mark.teacherId,
      mark: mark.mark,
    });
    setShowModal(true);
  };

const handleDelete = async () => {
  try {
    await api.delete(`/marks/${confirmDelete}`);
    success("Mark deleted successfully");
    setConfirmDelete(null);
    fetchMarks();
  } catch {
    error("Failed to delete mark");
  }
};

  const columns = [
    { header: "No.", accessor: "rowNumber", render: (row, index) => index + 1 },
    { header: "Student", accessor: "student", render: (row) => row.student?.fullName },
    { header: "Course", accessor: "course", render: (row) => row.course?.courseName },
    { header: "Teacher", accessor: "teacher", render: (row) => row.teacher?.fullName },
    { header: "Mark", accessor: "mark" },
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
      <div className={`${currentTheme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow flex justify-between`}>
        <h2 className={`text-xl font-bold ${modalText}`}>Marks</h2>
        <button
          onClick={() => {
            setEditingMark(null);
            setShowModal(true);
            setFormData({ studentId: "", courseId: "", teacherId: "", mark: "" });
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Add Mark
        </button>
      </div>

      {/* Marks Table */}
      <div className={`${currentTheme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow`}>
        <DataTable columns={columns} data={marks} />
      </div>

      {/* Add/Edit Mark Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 p-4">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingMark ? "Edit Mark" : "Add Mark"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>

              <select
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.courseName}</option>)}
              </select>

              <select
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>

              <input
                type="number"
                placeholder="Mark"
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
                value={formData.mark}
                onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                required
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
                  {editingMark ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
  <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
    <div className={`${modalBg} p-6 rounded-lg w-[350px]`}>
      <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>
        Delete Mark
      </h3>

      <p className={`mb-4 text-sm ${modalText}`}>
        Are you sure you want to delete this mark?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setConfirmDelete(null)}
          className={`${
            currentTheme === "dark"
              ? "border-gray-600 text-white"
              : "border-gray-300 text-gray-900"
          } px-3 py-2 border rounded`}
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

export default MarksPage;