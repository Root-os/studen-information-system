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

const EnrollmentsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const {  error } = useToast();

  const { canCreate, canUpdate, canDelete } = usePagePermission("enrolments");

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  // const [confirmDelete, setConfirmDelete] = useState(null);

  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    academicYearId: "",
    enrollmentDate: "",
    status: "ACTIVE",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Fetch enrollments, students, and courses

  const fetchClasses = async () => {
    try {
      const res = await api.get("/class");
      setClasses(res.data.data || []);
    } catch {
      error("Failed to fetch classes");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academicYear");
      const years = res.data.data || [];

      setAcademicYears(years);

      const currentYear = years.find((year) => year.isCurrent);

      if (currentYear) {
        setFormData((prev) => ({
          ...prev,
          academicYearId: currentYear.id,
        }));
      }
    } catch {
      error("Failed to fetch academic years");
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data.data || []);
    } catch {
      error("Failed to fetch enrollments");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/users");

      // const users = res.data.data || res.data || [];

      setStudents(res.data.data || res.data || []);
    } catch {
      error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const resetForm = () => {
    const currentYear = academicYears.find((y) => y.isCurrent);

    return {
      studentId: "",
      classId: "",
      academicYearId: currentYear?.id || "",
      enrollmentDate: "",
      status: "ACTIVE",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEnrollment) {
        await api.put(`/enrollments/${editingEnrollment.id}`, formData);
        // success("Enrollment updated successfully");
        showStatus(
          "success",
          "Update Successful",
          "Enrollment updated successfully",
        );
      } else {
        await api.post("/enrollments", formData);
        // success("Enrollment created successfully");
        showStatus(
          "success",
          "Creation Successful",
          "Enrollment created successfully",
        );
      }

      setShowModal(false);
      setEditingEnrollment(null);
      setFormData(resetForm());
      fetchEnrollments();
    } catch (err) {
      error("Something went wrong");
      showStatus(
        "error",
        "Update Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while creating/updating enrollment",
      );
    }
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);

    setFormData({
      studentId: enrollment.studentId,
      classId: enrollment.classId,
      academicYearId: enrollment.academicYearId,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
    });

    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEnrollment) return;

    try {
      setDeleting(true);

      await api.delete(`/enrollments/${selectedEnrollment.id}`);

      showStatus(
        "success",
        "Delete Successful",
        "Enrollment deleted successfully",
      );

      fetchEnrollments();

      setDeleteModalOpen(false);
      setSelectedEnrollment(null);
    } catch (err) {
      showStatus(
        "error",
        "Delete Failed",
        err?.response?.data?.message || err?.message,
      );
    } finally {
      setDeleting(false);
    }
  };

  const enrollmentFields = [
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: students.map((student) => ({
        value: student.id,
        label: student.fullName,
      })),
    },

    {
      name: "classId",
      label: "Class",
      type: "select",
      options: classes.map((cls) => ({
        value: cls.id,
        label: cls.className,
      })),
    },

    {
      name: "academicYearId",
      label: "Academic Year",
      type: "select",
      disabled: true,
      options: academicYears.map((year) => ({
        value: year.id,
        label: year.yearName,
      })),
    },

    {
      name: "enrollmentDate",
      label: "Enrollment Date",
      type: "date",
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        {
          value: "ACTIVE",
          label: "ACTIVE",
        },
        {
          value: "TRANSFERRED",
          label: "TRANSFERRED",
        },
        {
          value: "DROPPED",
          label: "DROPPED",
        },
        {
          value: "COMPLETED",
          label: "COMPLETED",
        },
      ],
    },
  ];

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (_, index) => index + 1,
    },
    {
      header: "Student",
      accessor: "student",
      render: (row) => row.User?.fullName ?? "-",
    },
    {
      header: "Class",
      accessor: "class",
      render: (row) => row.class?.className ?? "-",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      render: (row) => row.academicYear?.yearName ?? "-",
    },
    {
      header: "Enrollment Date",
      accessor: "enrollmentDate",
    },
    {
      header: "Status",
      accessor: "status",
    },
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
                setSelectedEnrollment(row);
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

  // const modalBg = currentTheme === "dark" ? "bg-gray-900" : "bg-white";
  const modalText = theme.text;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`p-6 rounded-lg shadow flex justify-between ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        <h2 className={`text-xl font-bold ${modalText}`}>Enrollments</h2>
        {canCreate && (
          <button
            onClick={() => {
              const currentYear = academicYears.find((y) => y.isCurrent);

              setFormData({
                studentId: "",
                classId: "",
                academicYearId: currentYear?.id || "",
                enrollmentDate: "",
                status: "ACTIVE",
              });

              setEditingEnrollment(null);
              setShowModal(true);
            }}
            className={`${theme.primary} text-white px-4 py-2 rounded`}
          >
            + Add Enrollment
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className={`p-6 rounded-lg shadow ${currentTheme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        <DataTable columns={columns} data={enrollments} />
      </div>

      {/* Create/Edit Modal */}
      <CrudFormModal
        open={showModal}
        title={editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
        fields={enrollmentFields}
        values={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditingEnrollment(null);

          setFormData({
            studentId: "",
            classId: "",
            academicYearId: "",
            enrollmentDate: "",
            status: "ACTIVE",
          });
        }}
        submitLabel={editingEnrollment ? "Update" : "Create"}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Enrollment"
        message={`Are you sure you want to delete this enrollment? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedEnrollment(null);
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

export default EnrollmentsPage;
