import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import usePagePermission from "../../hooks/userPagePermission";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";

const RolePage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { canCreate, canUpdate, canDelete } = usePagePermission("classes");
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) => {
    setStatusModal({ open: true, type, title, message });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/role");
      setRoles(res.data.data || []);
    } catch (err) {
      error("Failed to fetch roles");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRole) {
        await api.put(`/role/${editingRole.id}`, formData);
        // success("Role updated successfully");
        showStatus("success", "Updated", "Role updated successfully");
      } else {
        await api.post("/role", formData);
        success("Role created successfully");
        showStatus("success", "Created", "Role created successfully");
      }

      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: "", description: "" });
      fetchRoles();
    } catch (err) {
      error("Something went wrong");
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/role/${selectedRole.id}`);
      // success("Role deleted successfully");
      showStatus("success", "Deleted", "Role deleted successfully");

      setDeleteModalOpen(false);
      setSelectedRole(null);

      setConfirmDelete(null);
      fetchRoles();
    } catch (err) {
      error("Failed to delete role");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (row, index) => index + 1,
    },
    { header: "Role Name", accessor: "name" },
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
              onClick={() => {
                setSelectedRole(row);
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
        <h2 className={`text-xl font-bold ${modalText}`}>Roles</h2>

        {canCreate && (
          <button
            onClick={() => {
              setEditingRole(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Role
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        {/* ✅ Data is ALWAYS array now */}
        <DataTable columns={columns} data={roles} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingRole ? "Edit Role" : "Add Role"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Role Name"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Description"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                  {editingRole ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
        // loading={deleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

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

export default RolePage;
