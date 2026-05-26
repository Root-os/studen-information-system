import React, { useEffect, useState, useContext } from "react";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../components/ui/toast";

const DepartmentsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      if (editingDepartment) {
        await api.put(`/department/${editingDepartment.id}`, formData);
        success("Department updated successfully");
      } else {
        await api.post("/department", formData);
        success("Department created successfully");
      }

      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ name: "", description: "" });
      fetchDepartments();
    } catch {
      error("Something went wrong");
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/department/${confirmDelete}`);
      success("Department deleted successfully");
      setConfirmDelete(null);
      fetchDepartments();
    } catch {
      error("Failed to delete department");
    }
  };

  const columns = [
    { header: "No.", accessor: "rowNumber", render: (_, index) => index + 1 },
    { header: "Department Name", accessor: "name" },
    { header: "Description", accessor: "description" },
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
        <h2 className={`text-xl font-bold ${modalText}`}>Departments</h2>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setShowModal(true);
          }}
          className={`${theme.primary} text-white px-4 py-2 rounded`}
        >
          + Add Department
        </button>
      </div>

      {/* Table */}
      <div
        className={`${
          currentTheme === "dark" ? "bg-gray-800" : "bg-white"
        } p-6 rounded-lg shadow`}
      >
        <DataTable columns={columns} data={departments} />
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className={`${modalBg} p-6 rounded-lg w-[400px]`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalText}`}>
              {editingDepartment ? "Edit Department" : "Add Department"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Department Name"
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
              <input
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
                  {editingDepartment ? "Update" : "Create"}
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
            <h3 className={`text-lg font-semibold mb-3 ${modalText}`}>
              Delete Department
            </h3>
            <p className={`mb-4 text-sm ${modalText}`}>
              Are you sure you want to delete this department?
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

export default DepartmentsPage;