import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";

const UserDepartmentPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    departmentId: "",
    role: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAssignments();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/user-department");
      setAssignments(res.data);
    } catch {
      error("Failed to fetch assignments");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      error("Failed to fetch users");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department");
      setDepartments(res.data);
    } catch {
      error("Failed to fetch departments");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await api.put(`/user-department/${editingAssignment.id}`, formData);
        success("Assignment updated successfully");
      } else {
        await api.post("/user-department/assign", formData);
        success("Assignment created successfully");
      }

      setShowModal(false);
      setEditingAssignment(null);
      setFormData({ userId: "", departmentId: "", role: "" });
      fetchAssignments();
    } catch {
      error("Something went wrong");
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      userId: assignment.userId,
      departmentId: assignment.departmentId,
      role: assignment.role,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/user-department/${confirmDelete}`);
      success("Assignment deleted successfully");
      setConfirmDelete(null);
      fetchAssignments();
    } catch {
      error("Failed to delete assignment");
    }
  };

  const columns = [
    { header: "No.", accessor: "rowNumber", render: (_, i) => i + 1 },
    { header: "User", accessor: "User", render: (row) => row.User.fullName },
    { header: "Email", accessor: "UserEmail", render: (row) => row.User.email },
    { header: "Department", accessor: "Department", render: (row) => row.Department.name },
    { header: "Role", accessor: "role" },
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
        <h2 className={`text-xl font-bold ${modalText}`}>User-Department Assignments</h2>
        <button
          onClick={() => {
            setEditingAssignment(null);
            setShowModal(true);
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Assign User
        </button>
      </div>

      {/* Table */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <DataTable columns={columns} data={assignments} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingAssignment ? "Edit Assignment" : "Assign User to Department"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                required
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>

              <select
                required
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                required
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`${
                    currentTheme === "dark"
                      ? "border-gray-600 text-white"
                      : "border-gray-300 text-gray-900"
                  } px-3 py-2 border rounded`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${theme.primary} text-white px-4 py-2 rounded`}
                >
                  {editingAssignment ? "Update" : "Assign"}
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
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>Delete Assignment</h3>
            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this assignment?
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

export default UserDepartmentPage;