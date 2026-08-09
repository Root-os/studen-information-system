import React, { useState, useContext, useEffect } from "react";
import { FiUpload, FiExternalLink, FiX } from "react-icons/fi";
import api from "../../hooks/api";
import { AuthContext } from "../../contexts/AuthContext";
import ThemeContext from "../../components/layout/ThemeContext";
import StatusModal from "../../components/ui/successModal";

const RegisterStudent = () => {
  const { user } = useContext(AuthContext);
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const today = new Date().toISOString().split("T")[0];

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
    familySubCity: "",
    familyWoreda: "",
    familyHomeNumber: "",
    familyPhone: "",
    registeredDate: today,
    class: "",
    status: "ACTIVE",
    // approvedBy stores the logged-in user's numeric id (not their name)
    approvedBy: "",
    // approvedDate mirrors registeredDate
    approvedDate: today,
    email: "",
    password: "",
    roleId: "",
    category: "student",
    generateId: "skip",
  });

  const [studentPhoto, setStudentPhoto] = useState(null);
  const [familyPhoto, setFamilyPhoto] = useState(null);
  const [otherDocument, setOtherDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) =>
    setStatusModal({ open: true, type, title, message });

  // Set approvedBy to the logged-in user's id whenever the user object changes
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, approvedBy: user.id }));
    }
  }, [user?.id]);

  // Auto-fetch the "Student" role id
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/role");
        const studentRole = (res.data?.data ?? res.data ?? []).find(
          (r) => r.name.toLowerCase() === "student"
        );
        if (studentRole) {
          setFormData((prev) => ({ ...prev, roleId: studentRole.id }));
        }
      } catch {
        // non-fatal
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Keep approvedDate in sync with registeredDate
      if (name === "registeredDate") updated.approvedDate = value;
      return updated;
    });
  };

  const handleFileChange = (e, type) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (type === "student") setStudentPhoto(file);
    else if (type === "family") setFamilyPhoto(file);
    else if (type === "other") setOtherDocument(file);
  };

  const resetForm = () => {
    const newToday = new Date().toISOString().split("T")[0];
    setFormData({
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
      familySubCity: "",
      familyWoreda: "",
      familyHomeNumber: "",
      familyPhone: "",
      registeredDate: newToday,
      class: "",
      status: "ACTIVE",
      approvedBy: user?.id ?? "",
      approvedDate: newToday,
      email: "",
      password: "",
      roleId: formData.roleId, // preserve fetched roleId
      category: "student",
      generateId: "skip",
    });
    setStudentPhoto(null);
    setFamilyPhoto(null);
    setOtherDocument(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (studentPhoto) data.append("studentPhoto", studentPhoto);
      if (familyPhoto) data.append("familyPhoto", familyPhoto);
      if (otherDocument) data.append("otherDocument", otherDocument);

      await api.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showStatus("success", "Registration Successful", "Student registered successfully.");
      resetForm();
    } catch (err) {
      console.error(err);
      showStatus(
        "error",
        "Registration Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while registering the student."
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared class strings
  const sectionCls = `p-5 border rounded-lg ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`;
  const headingCls = `text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-800"}`;
  const labelCls = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const inputCls = `mt-1 border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  }`;
  const readonlyCls = `mt-1 border rounded px-3 py-2 w-full ${
    isDark ? "bg-gray-600 border-gray-600 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-600"
  }`;

  return (
    <div className={`max-w-5xl mx-auto p-6 shadow rounded-lg ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Page title */}
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Sunday School Student Registration
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Ethiopian Orthodox Tewahedo Church
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Info */}
        <section className={sectionCls}>
          <h3 className={headingCls}>Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Full Name *", name: "fullName", required: true },
              { label: "Baptism Name", name: "baptismaName" },
              { label: "Confession Father", name: "hollyFatherName" },
              { label: "Confession Father Phone", name: "hollyFatherPhone" },
              { label: "Phone", name: "phone" },
              { label: "Education Level", name: "educationLevel" },
              { label: "Address", name: "address" },
              { label: "SubCity", name: "SubCity" },
              { label: "Woreda", name: "woreda" },
              { label: "Home Number", name: "homeNumber" },
              { label: "Class", name: "class" },
            ].map(({ label, name, required }) => (
              <div key={name}>
                <label className={labelCls}>{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required={required}
                  className={inputCls}
                />
              </div>
            ))}

            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputCls}>
                <option value="student">Student</option>
                <option value="regullar">Regular</option>
                <option value="unique_regular">Unique Regular</option>
                <option value="honorary_members">Honorary Members</option>
              </select>
            </div>
          </div>
        </section>

        {/* Guardian Info */}
        <section className={sectionCls}>
          <h3 className={headingCls}>Parent / Guardian Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Guardian Name", name: "famillyFullName" },
              { label: "Relationship", name: "Relationship" },
              { label: "Guardian Phone", name: "familyPhone" },
              { label: "Family Address", name: "familyAddress" },
              { label: "Family Woreda", name: "familyWoreda" },
              { label: "Family Home Number", name: "familyHomeNumber" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className={labelCls}>{label}</label>
                <input type="text" name={name} value={formData[name]} onChange={handleChange} className={inputCls} />
              </div>
            ))}
          </div>
        </section>

        {/* Account Info */}
        <section className={sectionCls}>
          <h3 className={headingCls}>Account Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <input value="Student" readOnly className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>Generate Student ID</label>
              <select name="generateId" value={formData.generateId} onChange={handleChange} className={inputCls}>
                <option value="apply">Apply</option>
                <option value="skip">Skip</option>
              </select>
            </div>
          </div>
        </section>

        {/* Approval */}
        <section className={sectionCls}>
          <h3 className={headingCls}>Approval</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Approved By</label>
              {/* Shows the logged-in user's name for display; the id is what gets saved */}
              <input value={user?.fullName ?? `User #${user?.id ?? ""}`} readOnly className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>Approved Date</label>
              <input type="date" name="registeredDate" value={formData.registeredDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className={sectionCls}>
          <h3 className={headingCls}>Documents</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <FileUpload label="Student Photo" accept="image/*" file={studentPhoto}
              onChange={(e) => handleFileChange(e, "student")} onClear={() => setStudentPhoto(null)} isDark={isDark} />
            <FileUpload label="Family Photo" accept="image/*" file={familyPhoto}
              onChange={(e) => handleFileChange(e, "family")} onClear={() => setFamilyPhoto(null)} isDark={isDark} />
            <FileUpload label="Other Document" accept=".jpg,.jpeg,.png,.pdf" file={otherDocument}
              onChange={(e) => handleFileChange(e, "other")} onClear={() => setOtherDocument(null)} isDark={isDark} />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-colors"
        >
          {loading ? "Registering..." : "Register Student"}
        </button>
      </form>

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

export default RegisterStudent;

/* ── File upload card ── */
const FileUpload = ({ label, accept, file, onChange, onClear, isDark }) => {
  const isPdf = (f) => f?.type === "application/pdf" || f?.name?.toLowerCase().endsWith(".pdf");
  const preview = file ? URL.createObjectURL(file) : null;
  const borderCls = isDark ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <div className={`border rounded-lg p-4 flex flex-col gap-3 ${borderCls}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
        <label className="flex items-center gap-1 text-xs text-blue-500 cursor-pointer hover:underline">
          <FiUpload size={13} />
          {file ? "Replace" : "Upload"}
          <input type="file" hidden accept={accept} onChange={onChange} />
        </label>
      </div>

      {file ? (
        <div className="relative">
          {isPdf(file) ? (
            <a href={preview} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
              <FiExternalLink size={14} />{file.name}
            </a>
          ) : (
            <img src={preview} alt={label} className="w-full h-32 object-cover rounded border dark:border-gray-600" />
          )}
          <p className="text-xs text-green-500 mt-1 truncate">📄 {file.name}</p>
          <button type="button" onClick={onClear}
            className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 text-gray-500 hover:text-red-500">
            <FiX size={13} />
          </button>
        </div>
      ) : (
        <p className={`text-xs text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No file selected</p>
      )}
    </div>
  );
};
