import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import CrudFormModal from "../../components/ui/crudForm";
import usePagePermission from "../../hooks/userPagePermission";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";

const CourseAssignmentPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { error } = useToast();

  const { canCreate, canUpdate, canDelete } = usePagePermission("courseAssign");

  const [assignments, setAssignments] = useState([]);

  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    classId: "",
    teacherId: "",
    academicYearId: "",
  });

  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) => {
    setStatusModal({ open: true, type, title, message });
  };

  // FETCH DATA
  const fetchAssignments = async () => {
    try {
      const res = await api.get("/courseAssign");
      setAssignments(res.data.data || []);
    } catch {
      error("Failed to fetch assignments");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teacher");
      setTeachers(res.data || []);
    } catch {
      error("Failed to fetch teachers");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch {
      error("Failed to fetch courses");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/class");
      setClasses(res.data.data || []);
    } catch {
      error("Failed to fetch classes");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academicYear");
      setAcademicYears(res.data.data || []);
    } catch {
      error("Failed to fetch academic years");
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchTeachers();
    fetchCourses();
    fetchClasses();
    fetchAcademicYears();
  }, []);

  // RESET FORM
  const resetForm = () => ({
    courseId: "",
    classId: "",
    teacherId: "",
    academicYearId: "",
  });

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/courseAssign/${editing.id}`, formData);
        showStatus("success", "Updated", "Assignment updated successfully");
      } else {
        await api.post("/courseAssign", formData);
        showStatus("success", "Created", "Assignment created successfully");
      }

      setShowModal(false);
      setEditing(null);
      setFormData(resetForm());
      fetchAssignments();
    } catch (err) {
      showStatus(
        "error",
        "Failed",
        err?.response?.data?.message || err?.message
      );
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setEditing(item);

    setFormData({
      courseId: item.courseId,
      classId: item.classId,
      teacherId: item.teacherId,
      academicYearId: item.academicYearId,
    });

    setShowModal(true);
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);

      await api.delete(`/courseAssign/${selectedItem.id}`);

      showStatus("success", "Deleted", "Assignment deleted successfully");

      setDeleteModalOpen(false);
      setSelectedItem(null);

      fetchAssignments();
    } catch (err) {
      showStatus("error", "Delete Failed", err?.message);
    } finally {
      setDeleting(false);
    }
  };

  // FORM FIELDS
  const fields = [
    {
      name: "courseId",
      label: "Course",
      type: "select",
      options: courses.map((c) => ({
        value: c.id,
        label: c.courseName || c.name,
      })),
    },
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: classes.map((c) => ({
        value: c.id,
        label: c.className,
      })),
    },
    {
      name: "teacherId",
      label: "Teacher",
      type: "select",
      options: teachers.map((t) => ({
        value: t.id,
        label: t.fullName,
      })),
    },
    {
      name: "academicYearId",
      label: "Academic Year",
      type: "select",
      options: academicYears.map((y) => ({
        value: y.id,
        label: y.yearName,
      })),
    },
  ];

  // TABLE COLUMNS
  const columns = [
    {
      header: "No",
      accessor: "no",
      render: (_, i) => i + 1,
    },
    {
      header: "Course",
      accessor: "course",
      render: (row) => row.course?.courseName || "-",
    },
    {
      header: "Class",
      accessor: "class",
      render: (row) => row.class?.className || "-",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      render: (row) => row.teacher?.fullName || "-",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      render: (row) => row.academicYear?.yearName || "-",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-500 p-2 hover:bg-blue-100 rounded"
            >
              <FiEdit />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setDeleteModalOpen(true);
              }}
              className="text-red-500 p-2 hover:bg-red-100 rounded"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className={`p-6 rounded shadow flex justify-between ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${theme.text}`}>Course Assignments</h2>

        {canCreate && (
          <button
            onClick={() => {
              setFormData(resetForm());
              setEditing(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Assign Course
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`p-6 rounded shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={assignments} />
      </div>

      {/* Modal */}
      <CrudFormModal
        open={showModal}
        title={editing ? "Edit Assignment" : "Assign Course"}
        fields={fields}
        values={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        submitLabel={editing ? "Update" : "Create"}
      />

      {/* Delete */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment?"
        loading={deleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Status */}
      <StatusModal
        open={statusModal.open}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((p) => ({ ...p, open: false }))}
      />
    </div>
  );
};

export default CourseAssignmentPage;