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

const TeachersPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { error } = useToast();

  const { canCreate, canUpdate, canDelete } = usePagePermission("teachers");

  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    userName: "",
    password: "",
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

  // FETCH
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teacher");
      setTeachers(res.data || []);
    } catch {
      error("Failed to fetch teachers");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // RESET FORM
  const resetForm = () => ({
    fullName: "",
    phone: "",
    userName: "",
    password: "",
  });

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };

      if (editingTeacher) {
        await api.put(`/teacher/${editingTeacher.id}`, payload);
        showStatus("success", "Update Successful", "Teacher updated successfully");
      } else {
        await api.post("/teacher", payload);
        showStatus("success", "Creation Successful", "Teacher created successfully");
      }

      setShowModal(false);
      setEditingTeacher(null);
      setFormData(resetForm());
      fetchTeachers();
    } catch (err) {
      showStatus(
        "error",
        "Request Failed",
        err?.response?.data?.message || err?.message || "Something went wrong"
      );
    }
  };

  // EDIT
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      phone: teacher.phone,
      userName: teacher.userName,
      password: "", // keep empty for security
    });
    setShowModal(true);
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      setDeleting(true);
      await api.delete(`/teacher/${selectedTeacher.id}`);
      showStatus("success", "Deleted", "Teacher deleted successfully");
      setDeleteModalOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      showStatus(
        "error",
        "Delete Failed",
        err?.response?.data?.message || err?.message
      );
    } finally {
      setDeleting(false);
    }
  };

  // FORM FIELDS
  const teacherFields = [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "userName", label: "Username", type: "text" },
    { name: "password", label: "Password", type: "password" },
  ];

  // TABLE COLUMNS
  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (_, index) => index + 1,
    },
    { header: "Full Name", accessor: "fullName" },
    { header: "Phone", accessor: "phone" },
    { header: "Username", accessor: "userName" },
    {
      header: "Role",
      accessor: "role",
      render: (row) => row.role?.name || "-",
    },
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
              onClick={() => {
                setSelectedTeacher(row);
                setDeleteModalOpen(true);
              }}
              className="p-2 rounded-md hover:bg-red-100 text-red-500"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className={`p-6 rounded-lg shadow flex justify-between ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${theme.text}`}>Teachers</h2>

        {canCreate && (
          <button
            onClick={() => {
              setFormData(resetForm());
              setEditingTeacher(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Teacher
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`p-6 rounded-lg shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={teachers} />
      </div>

      {/* Modal */}
      <CrudFormModal
        open={showModal}
        title={editingTeacher ? "Edit Teacher" : "Add Teacher"}
        fields={teacherFields}
        values={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditingTeacher(null);
          setFormData(resetForm());
        }}
        submitLabel={editingTeacher ? "Update" : "Create"}
      />

      {/* Delete */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher?"
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
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />

    </div>
  );
};

export default TeachersPage;