import React, { useEffect, useState, useContext } from "react";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ThemeContext from "../../components/layout/ThemeContext";
import { useToast } from "../../components/ui/toast";

const ComplaintsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    complainant: "",
    respondant: "",
    complaint: "",
  });

  // Fetch complaints and users
  useEffect(() => {
    fetchComplaints();
    fetchUsers();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      setComplaints(res.data);
    } catch {
      error("Failed to fetch complaints");
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

    if (formData.complainant === formData.respondant) {
      return error("Complainant and respondent cannot be the same user");
    }

    try {
      if (editingComplaint) {
        await api.put(`/complaints/${editingComplaint.id}`, formData);
        success("Complaint updated successfully");
      } else {
        await api.post("/complaints", formData);
        success("Complaint created successfully");
      }

      setShowModal(false);
      setEditingComplaint(null);
      setFormData({ complainant: "", respondant: "", complaint: "" });
      fetchComplaints();
    } catch (err) {
      error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      complainant: complaint.complainant,
      respondant: complaint.respondant,
      complaint: complaint.complaint,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/complaints/${confirmDelete}`);
      success("Complaint deleted successfully");
      setConfirmDelete(null);
      fetchComplaints();
    } catch {
      error("Failed to delete complaint");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (_, index) => index + 1,
    },
    {
      header: "Complainant",
      accessor: "complainantUser",
      render: (row) => row.complainantUser?.fullName || "-",
    },
    {
      header: "Respondent",
      accessor: "respondentUser",
      render: (row) => row.respondentUser?.fullName || "-",
    },
    { header: "Complaint", accessor: "complaint" },
    {
      header: "Complained At",
      accessor: "createdAt",
      render: (row) => new Date(row.createdAt).toLocaleString(),
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
  const modalText = currentTheme === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow flex justify-between`}
      >
        <h2 className={`text-xl font-bold ${modalText}`}>Complaints</h2>

        <button
          onClick={() => {
            setEditingComplaint(null);
            setShowModal(true);
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Add Complaint
        </button>
      </div>

      {/* Table */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <DataTable columns={columns} data={complaints} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingComplaint ? "Edit Complaint" : "Add Complaint"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                className={`w-full p-2 border rounded ${
                  currentTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={formData.complainant}
                onChange={(e) =>
                  setFormData({ ...formData, complainant: e.target.value })
                }
              >
                <option value="">Select Complainant</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>

              <select
                className={`w-full p-2 border rounded ${
                  currentTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={formData.respondant}
                onChange={(e) =>
                  setFormData({ ...formData, respondant: e.target.value })
                }
              >
                <option value="">Select Respondent</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Complaint"
                className={`w-full p-2 border rounded ${
                  currentTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={formData.complaint}
                onChange={(e) =>
                  setFormData({ ...formData, complaint: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-3 py-2 border rounded ${
                    currentTheme === "dark"
                      ? "border-gray-600 text-white"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`${theme.primary} text-white px-4 py-2 rounded`}
                >
                  {editingComplaint ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
          <div className={`${modalBg} p-6 rounded-lg w-[350px]`}>
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>
              Delete Complaint
            </h3>

            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this complaint?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`px-3 py-2 border rounded ${
                  currentTheme === "dark"
                    ? "border-gray-600 text-white"
                    : "border-gray-300 text-gray-900"
                }`}
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

export default ComplaintsPage;