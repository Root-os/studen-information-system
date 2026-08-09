import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import DataTable from "../../components/ui/table";
import api from "../../hooks/api";
import usePagePermission from "../../hooks/userPagePermission";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";
import ThemeContext from "../../components/layout/ThemeContext";

const StudentList = () => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { canView, canUpdate, canDelete } = usePagePermission("view students");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) =>
    setStatusModal({ open: true, type, title, message });

  useEffect(() => {
    fetchStudents({ status: "ACTIVE" });
  }, []);

  const fetchStudents = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: filters });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (categoryFilter) filters.category = categoryFilter;
    fetchStudents(filters);
  };

  const handleReset = () => {
    setStatusFilter("");
    setCategoryFilter("");
    fetchStudents();
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${selectedStudent.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setDeleteModalOpen(false);
      setSelectedStudent(null);
      showStatus("success", "Deleted", "Student deleted successfully.");
    } catch (err) {
      showStatus(
        "error",
        "Delete Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while deleting the student."
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { id: "rowNumber", header: "#", size: 60, Cell: ({ row }) => row.index + 1 },
    { accessorKey: "studentId", header: "Student ID" },
    { accessorKey: "fullName", header: "Full Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "date_of_birth", header: "Birth Date" },
    { accessorKey: "baptismaName", header: "Baptism Name" },
    { accessorKey: "hollyFatherName", header: "Holy Father" },
    { accessorKey: "hollyFatherPhone", header: "Father Phone" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "SubCity", header: "Sub City" },
    { accessorKey: "woreda", header: "Woreda" },
    { accessorKey: "homeNumber", header: "Home No" },
    { accessorKey: "educationLevel", header: "Education Level" },
    { accessorKey: "class", header: "Class" },
    { accessorKey: "famillyFullName", header: "Family Name" },
    { accessorKey: "Relationship", header: "Relationship" },
    { accessorKey: "familyPhone", header: "Family Phone" },
    { accessorKey: "familyAddress", header: "Family Address" },
    { accessorKey: "registeredDate", header: "Registered Date" },
    { accessorKey: "status", header: "Status" },
    { accessorFn: (row) => row.role?.name, header: "Role" },
    { accessorKey: "category", header: "Category" },
  ];

  // Shared class strings
  const selectCls = `border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-800"
  }`;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className={`p-5 rounded-lg shadow border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Students
        </h2>
        <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Manage registered students
        </p>
      </div>

      {/* Filters row + Add Student button */}
      <div className={`p-4 rounded-lg shadow border flex flex-wrap gap-3 items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        {/* Left: filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="">Select Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
            <option value="">Select Category</option>
            <option value="student">Student</option>
            <option value="regullar">Regular</option>
            <option value="unique_regular">Unique Regular</option>
            <option value="honorary_members">Honorary Members</option>
          </select>

          <button onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            Filter
          </button>
          <button onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-600 transition-colors">
            Reset
          </button>
        </div>

        {/* Right: Add Student */}
        <button
          onClick={() => navigate("/register-student")}
          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Add Student
        </button>
      </div>

      {/* Table wrapped in same card background */}
      <div className={`rounded-lg shadow border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        enableRowActions
        renderRowActions={({ row }) => (
          <>
            {canUpdate && (
              <IconButton color="primary" onClick={() => navigate(`/students/edit/${row.original.id}`)}>
                <Edit />
              </IconButton>
            )}
            {canView && (
              <IconButton color="info" onClick={() => navigate(`/students/${row.original.id}`)}>
                <Visibility />
              </IconButton>
            )}
            {canDelete && (
              <IconButton color="error" onClick={() => { setSelectedStudent(row.original); setDeleteModalOpen(true); }}>
                <Delete />
              </IconButton>
            )}
          </>
        )}
      />
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.fullName}? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => { setDeleteModalOpen(false); setSelectedStudent(null); }}
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

export default StudentList;
