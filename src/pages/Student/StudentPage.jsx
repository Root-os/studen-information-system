import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import DataTable from "../../components/ui/table";
import api from "../../hooks/api";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters start empty for user selection
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const navigate = useNavigate();

  // Initial load: default ACTIVE/STUDENT/student
  useEffect(() => {
    fetchStudents({ status: "ACTIVE", role: "STUDENT", category: "student" });
  }, []);

  const fetchStudents = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/users/filter", { params: filters });
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
    if (roleFilter) filters.role = roleFilter;
    if (categoryFilter) filters.category = categoryFilter;
    fetchStudents(filters);
  };

  const handleReset = () => {
    setStatusFilter("");
    setRoleFilter("");
    setCategoryFilter("");
    // Reload initial default
    fetchStudents({ status: "ACTIVE", role: "STUDENT", category: "student" });
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
    { accessorKey: "role", header: "Role" },
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">Select Role</option>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="ADMIN">Admin</option>
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
            <IconButton color="primary" onClick={() => console.log("Edit", row.original)}>
              <Edit />
            </IconButton>

            <IconButton color="info" onClick={() => navigate(`/students/${row.original.id}`)}>
              <Visibility />
            </IconButton>

            <IconButton color="error" onClick={() => console.log("Delete", row.original)}>
              <Delete />
            </IconButton>
          </>
        )}
      />
    </div>
  );
};

export default StudentList;