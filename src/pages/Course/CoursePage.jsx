import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import usePagePermission from "../../hooks/userPagePermission";
import CrudFormModal from "../../components/ui/crudForm";
import StatusModal from "../../components/ui/successModal";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";

const CoursesPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { canCreate, canUpdate, canDelete } = usePagePermission("courses");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
  });

  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success", // success | error
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) => {
    setStatusModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      error("Failed to fetch courses");
      showStatus(
        "error",
        "Load Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load student data",
      );
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        // success("Course updated successfully");
        showStatus(
          "success",
          "Update Successful",
          "Course updated successfully",
        );
      } else {
        await api.post("/courses", formData);
        // success("Course created successfully");
        showStatus(
          "success",
          "Creation Successful",
          "Course created successfully",
        );
      }

      setShowModal(false);
      setEditingCourse(null);
      setFormData({ courseName: "", courseCode: "", description: "" });
      fetchCourses();
    } catch (err) {
      // error("Something went wrong");
      showStatus(
        "error",
        "Update Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while updating Course",
      );
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      description: course.description,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${confirmDelete}`);
      // success("Course deleted successfully");
      showStatus("success", "Delete Successful", "Course deleted successfully");
      setConfirmDelete(null);
      fetchCourses();
    } catch (err) {
      // error("Failed to delete course");
      showStatus(
        "error",
        "Delete Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while deleting course",
      );
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
    { header: "Description", accessor: "description" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={() => handleEdit(row)}
              className="p-2 rounded-md hover:bg-blue-100 text-blue-500"
            >
              <FiEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setConfirmDelete(row.id)}
              className="p-2 rounded-md hover:bg-red-100 text-red-500"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const courseFields = [
    {
      name: "courseName",
      label: "Course Name",
      type: "text",
      placeholder: "Enter course name",
    },
    {
      name: "courseCode",
      label: "Course Code",
      type: "text",
      placeholder: "Enter course code",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 4,
      placeholder: "Enter course description",
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

        {canCreate && (
          <button
            onClick={() => {
              setEditingCourse(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Course
          </button>
        )}
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
      <CrudFormModal
        open={showModal}
        title={editingCourse ? "Edit Course" : "Add Course"}
        fields={courseFields}
        values={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
          setFormData({
            courseName: "",
            courseCode: "",
            description: "",
          });
        }}
        submitLabel={editingCourse ? "Update" : "Create"}
      />

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

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedCourse?.courseName}? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDelete}
      />

      <StatusModal
        open={statusModal.open}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default CoursesPage;
