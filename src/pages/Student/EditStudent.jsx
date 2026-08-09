import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import api from "../../hooks/api";
import StudentForm from "../../components/ui/studentForm";
import StatusModal from "../../components/ui/successModal";
import ThemeContext from "../../components/layout/ThemeContext";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    date_of_birth: "",
    baptismaName: "",
    hollyFatherName: "",
    hollyFatherPhone: "",
    address: "",
    SubCity: "",
    woreda: "",
    homeNumber: "",
    educationLevel: "",
    phone: "",
    famillyFullName: "",
    Relationship: "",
    familyAddress: "",
    familyWoreda: "",
    familySubCity: "",
    familyHomeNumber: "",
    familyPhone: "",
    class: "",
    status: "ACTIVE",
    category: "student",
    email: "",
  });

  // New files chosen by the user in this session
  const [files, setFiles] = useState({
    studentPhoto: null,
    familyPhoto: null,
    otherDocument: null,
  });

  // Existing URLs already on the server
  const [existingFiles, setExistingFiles] = useState({
    studentPhoto: null,
    familyPhoto: null,
    otherDocument: null,
  });

  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) =>
    setStatusModal({ open: true, type, title, message });

  // ── Fetch student ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/users/${id}`);
        const s = res.data;

        setFormData({
          fullName: s.fullName || "",
          date_of_birth: s.date_of_birth || "",
          baptismaName: s.baptismaName || "",
          hollyFatherName: s.hollyFatherName || "",
          hollyFatherPhone: s.hollyFatherPhone || "",
          address: s.address || "",
          SubCity: s.SubCity || "",
          woreda: s.woreda || "",
          homeNumber: s.homeNumber || "",
          educationLevel: s.educationLevel || "",
          phone: s.phone || "",
          famillyFullName: s.famillyFullName || "",
          Relationship: s.Relationship || "",
          familyAddress: s.familyAddress || "",
          familyWoreda: s.familyWoreda || "",
          familySubCity: s.familySubCity || "",
          familyHomeNumber: s.familyHomeNumber || "",
          familyPhone: s.familyPhone || "",
          class: s.class || "",
          status: s.status || "ACTIVE",
          category: s.category || "student",
          email: s.email || "",
        });

        setExistingFiles({
          studentPhoto: s.studentPhoto || null,
          familyPhoto: s.familyPhoto || null,
          otherDocument: s.otherDocument || null,
        });
      } catch (err) {
        showStatus(
          "error",
          "Load Failed",
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load student data."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id]);

  // ── Update student ────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key] ?? "");
      });

      // Append each file individually only when a new one was chosen
      if (files.studentPhoto) data.append("studentPhoto", files.studentPhoto);
      if (files.familyPhoto) data.append("familyPhoto", files.familyPhoto);
      if (files.otherDocument) data.append("otherDocument", files.otherDocument);

      await api.put(`/users/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh existing file URLs after a successful save
      const refreshed = await api.get(`/users/${id}`);
      setExistingFiles({
        studentPhoto: refreshed.data.studentPhoto || null,
        familyPhoto: refreshed.data.familyPhoto || null,
        otherDocument: refreshed.data.otherDocument || null,
      });
      // Clear newly chosen files
      setFiles({ studentPhoto: null, familyPhoto: null, otherDocument: null });

      showStatus("success", "Update Successful", "Student updated successfully.");
    } catch (err) {
      showStatus(
        "error",
        "Update Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while updating the student."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className={`p-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Loading student…</div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Page title */}
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Edit Student
      </h1>

      {/* Back button */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}>
          <ArrowBack fontSize="small" />
          <span className="font-medium">Back to Students</span>
        </button>
      </div>

      <StudentForm
        mode="edit"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdate}
        loading={loading}
        // New file objects (null until user picks a file)
        studentPhoto={files.studentPhoto}
        setStudentPhoto={(file) => setFiles((prev) => ({ ...prev, studentPhoto: file }))}
        familyPhoto={files.familyPhoto}
        setFamilyPhoto={(file) => setFiles((prev) => ({ ...prev, familyPhoto: file }))}
        otherDocument={files.otherDocument}
        setOtherDocument={(file) => setFiles((prev) => ({ ...prev, otherDocument: file }))}
        // Existing URLs from server
        existingStudentPhoto={existingFiles.studentPhoto}
        existingFamilyPhoto={existingFiles.familyPhoto}
        existingOtherDocument={existingFiles.otherDocument}
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

export default EditStudent;
