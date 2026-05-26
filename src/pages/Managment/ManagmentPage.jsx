import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast"; 

const ManagementPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast(); 

  const [managementRoles, setManagementRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    assignedRole: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    fetchManagementRoles();
    fetchUsers();
  }, []);

  const fetchManagementRoles = async () => {
    try {
      const res = await api.get("/managemnt");
      setManagementRoles(res.data);
    } catch {
      error("Failed to fetch management roles");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/managemnt/${editingRole.id}`, formData);
        success("Role updated successfully");
      } else {
        await api.post("/managemnt", formData);
        success("Role assigned successfully");
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData({ userId: "", assignedRole: "", description: "", active: true });
      fetchManagementRoles();
    } catch {
      error("Something went wrong");
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      userId: role.userId,
      assignedRole: role.assignedRole,
      description: role.description || "",
      active: role.active,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/managemnt/${confirmDelete}`);
      success("Role deleted successfully");
      setConfirmDelete(null);
      fetchManagementRoles();
    } catch {
      error("Failed to delete role");
    }
  };

  const columns = [
  {
    header: "No.",
    accessor: "rowNumber",
    render: (row, index) => index + 1,
  },
  {
    header: "User Name",
    accessor: "User.fullName", // nested property
    render: (row) => row.User?.fullName || "-", 
  },
  {
    header: "User Email",
    accessor: "User.email",
    render: (row) => row.User?.email || "-", 
  },
  {
    header: "Assigned Role",
    accessor: "assignedRole",
  },
  {
    header: "Active",
    accessor: "active",
    render: (row) => (row.active ? "Yes" : "No"),
  },
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
        <h2 className={`text-xl font-bold ${modalText}`}>Management Roles</h2>
        <button
          onClick={() => { setEditingRole(null); setShowModal(true); }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Assign Role
        </button>
      </div>

      {/* Table */}
      <div className={`p-6 rounded-lg shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={managementRoles} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingRole ? "Edit Role" : "Assign Role"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>

              <input
                placeholder="Assigned Role"
                value={formData.assignedRole}
                onChange={(e) => setFormData({ ...formData, assignedRole: e.target.value })}
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
              />

              <input
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${currentTheme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} w-full p-2 border rounded`}
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`${currentTheme === "dark" ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"} px-3 py-2 border rounded`}
                >
                  Cancel
                </button>

                <button type="submit" className={`${theme.primary} text-white px-4 py-2 rounded`}>
                  {editingRole ? "Update" : "Assign"}
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
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>Delete Role</h3>
            <p className={`mb-4 text-sm ${modalText}`}>Are you sure you want to delete this role?</p>
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

export default ManagementPage;