import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import DataTable from "../../components/ui/table";
import api from "../../hooks/api";
import usePagePermission from "../../hooks/userPagePermission";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters start empty for user selection
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { canView, canUpdate, canDelete } = usePagePermission("view students");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchStudents({
      status: "ACTIVE",
    });
  }, []);

  const fetchStudents = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/users", {
        params: filters,
      });

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
      showStatus(
        "success",
        "Update Successful",
        "Student deleted successfully",
      );
    } catch (err) {
      console.error(err);
      showStatus(
        "error",
        "Update Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while deleting student",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      id: "rowNumber",
      header: "#",
      size: 60,
      Cell: ({ row }) => row.index + 1,
    },
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
    {
      accessorFn: (row) => row.role?.name,
      header: "Role",
    },
    { accessorKey: "category", header: "Category" },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">Select Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">Select Category</option>
          <option value="student">Student</option>
          <option value="regullar">Regular</option>
          <option value="unique_regular">Unique Regular</option>
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Filter
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        enableRowActions
        renderRowActions={({ row }) => (
          <>
            {canUpdate && (
              <IconButton
                color="primary"
                onClick={() => navigate(`/students/edit/${row.original.id}`)}
              >
                <Edit />
              </IconButton>
            )}

            {canView && (
              <IconButton
                color="info"
                onClick={() => navigate(`/students/${row.original.id}`)}
              >
                <Visibility />
              </IconButton>
            )}

            {canDelete && (
              <IconButton
                color="error"
                onClick={() => {
                  setSelectedStudent(row.original);
                  setDeleteModalOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            )}
          </>
        )}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.fullName}? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedStudent(null);
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

export default StudentList;
