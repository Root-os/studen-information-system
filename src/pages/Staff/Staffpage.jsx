import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";
import usePagePermission from "../../hooks/userPagePermission";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";

const StaffPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const { canCreate, canUpdate, canDelete } = usePagePermission("classes");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);


  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) => {
    setStatusModal({ open: true, type, title, message });
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    userName: "",
    password: "",
    responsibility: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  // ✅ FIXED API RESPONSE HANDLING
  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data.data || []);
    } catch (err) {
      error("Failed to fetch staff users");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, formData);
        // success("Staff updated successfully");
        showStatus("success", "Updated", "Staff Updated successfully");
      } else {
        await api.post("/staff", formData);
        // success("Staff created successfully");
        showStatus("success", "Updated", "Class Updated successfully");
      }

      setShowModal(false);
      setEditingStaff(null);
      setFormData({
        fullName: "",
        phoneNumber: "",
        userName: "",
        password: "",
        responsibility: "",
      });

      fetchStaff();
    } catch (err) {
      error("Something went wrong");
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      userName: staff.userName,
      password: "",
      responsibility: staff.responsibility || "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/staff/${confirmDelete}`);
      // success("Staff deleted successfully");
      showStatus("success", "Deleted", "Class Deleted successfully");
      setConfirmDelete(null);
      fetchStaff();
    } catch (err) {
      error("Failed to delete staff");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (row, index) => index + 1,
    },
    { header: "Full Name", accessor: "fullName" },
    { header: "Phone", accessor: "phoneNumber" },
    { header: "Username", accessor: "userName" },
    { header: "Responsibility", accessor: "responsibility" },
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

  const modalBg = currentTheme === "dark" ? "bg-gray-900" : "bg-white";
  const modalText = theme.text;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow flex justify-between`}
      >
        <h2 className={`text-xl font-bold ${modalText}`}>Staff Users</h2>

        {canCreate && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Staff
          </button>
        )}
      </div>

      {/* TABLE */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <DataTable columns={columns} data={staff} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[420px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Full Name"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />

              <input
                placeholder="Phone Number"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
              />

              <input
                placeholder="Username"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingStaff}
              />

              <input
                placeholder="Responsibility"
                className={`${
                  currentTheme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                } w-full p-2 border rounded`}
                value={formData.responsibility}
                onChange={(e) =>
                  setFormData({ ...formData, responsibility: e.target.value })
                }
              />

              {/* ACTIONS */}
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
                  {editingStaff ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[350px]`}>
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>
              Delete Staff
            </h3>

            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this staff user?
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

export default StaffPage;
