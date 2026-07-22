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

const ClassesPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { error } = useToast();
  const { canCreate, canUpdate, canDelete } = usePagePermission("classes");
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    className: "",
    description: "",
    isActive: true,
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
  const fetchClasses = async () => {
    try {
      const res = await api.get("/class");
      setClasses(res.data.data || []);
    } catch {
      error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // RESET FORM
  const resetForm = () => ({
    className: "",
    description: "",
    isActive: true,
  });

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/class/${editing.id}`, formData);
        showStatus("success", "Updated", "Class updated successfully");
      } else {
        await api.post("/class", formData);
        showStatus("success", "Created", "Class created successfully");
      }

      setShowModal(false);
      setEditing(null);
      setFormData(resetForm());
      fetchClasses();
    } catch (err) {
      showStatus(
        "error",
        "Request Failed",
        err?.response?.data?.message || err?.message
      );
    }
  };

  // EDIT
  const handleEdit = (cls) => {
    setEditing(cls);

    setFormData({
      className: cls.className,
      description: cls.description,
      isActive: cls.isActive,
    });

    setShowModal(true);
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedClass) return;

    try {
      setDeleting(true);
      await api.delete(`/class/${selectedClass.id}`);
      showStatus("success", "Deleted", "Class deleted successfully");
      setDeleteModalOpen(false);
      setSelectedClass(null);

      fetchClasses();
    } catch (err) {
      showStatus("error", "Delete Failed", err?.message);
    } finally {
      setDeleting(false);
    }
  };

  // FORM FIELDS
  const fields = [
    {
      name: "className",
      label: "Class Name",
      type: "text",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
    },
    {
      name: "isActive",
      label: "Active",
      type: "select",
      options: [
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
      ],
    },
  ];

  // TABLE COLUMNS
  const columns = [
    {
      header: "No",
      accessor: "no",
      render: (_, i) => i + 1,
    },
    {
      header: "Class Name",
      accessor: "className",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) =>
        row.isActive ? (
          <span className="text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-red-600 font-medium">Inactive</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-500 p-2 hover:bg-blue-100 rounded"
            >
              <FiEdit />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => {
                setSelectedClass(row);
                setDeleteModalOpen(true);
              }}
              className="text-red-500 p-2 hover:bg-red-100 rounded"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className={`p-6 rounded shadow flex justify-between ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${theme.text}`}>Classes</h2>

        {canCreate && (
          <button
            onClick={() => {
              setFormData(resetForm());
              setEditing(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Class
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`p-6 rounded shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={classes} />
      </div>

      {/* Modal */}
      <CrudFormModal
        open={showModal}
        title={editing ? "Edit Class" : "Add Class"}
        fields={fields}
        values={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setFormData(resetForm());
        }}
        submitLabel={editing ? "Update" : "Create"}
      />

      {/* Delete */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
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
        onClose={() => setStatusModal((p) => ({ ...p, open: false }))}
      />
    </div>
  );
};

export default ClassesPage;