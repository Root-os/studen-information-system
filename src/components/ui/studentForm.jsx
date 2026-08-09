import React, { useContext } from "react";
import { FiUpload, FiExternalLink, FiX } from "react-icons/fi";
import ThemeContext from "../../components/layout/ThemeContext";

const StudentForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  mode = "create",
  studentPhoto,
  setStudentPhoto,
  familyPhoto,
  setFamilyPhoto,
  otherDocument,
  setOtherDocument,
  existingStudentPhoto,
  existingFamilyPhoto,
  existingOtherDocument,
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "student") setStudentPhoto(file);
    if (type === "family") setFamilyPhoto(file);
    if (type === "other") setOtherDocument(file);
  };

  const sectionCls = `p-5 border rounded-lg ${
    isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
  }`;
  const headingCls = `text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-800"}`;
  const labelCls = `block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const inputCls = `w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  } disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* PERSONAL INFO */}
      <section className={sectionCls}>
        <h3 className={headingCls}>Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput isDark={isDark} label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} required />
          <FormInput isDark={isDark} label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
          <FormInput isDark={isDark} label="Baptism Name" name="baptismaName" value={formData.baptismaName} onChange={handleChange} />
          <FormInput isDark={isDark} label="Confession Father" name="hollyFatherName" value={formData.hollyFatherName} onChange={handleChange} />
          <FormInput isDark={isDark} label="Father Phone" name="hollyFatherPhone" value={formData.hollyFatherPhone} onChange={handleChange} />
          <FormInput isDark={isDark} label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <FormInput isDark={isDark} label="Education Level" name="educationLevel" value={formData.educationLevel} onChange={handleChange} />
          <FormInput isDark={isDark} label="Address" name="address" value={formData.address} onChange={handleChange} />
          <FormInput isDark={isDark} label="SubCity" name="SubCity" value={formData.SubCity} onChange={handleChange} />
          <FormInput isDark={isDark} label="Woreda" name="woreda" value={formData.woreda} onChange={handleChange} />
          <FormInput isDark={isDark} label="Home Number" name="homeNumber" value={formData.homeNumber} onChange={handleChange} />
          <FormInput isDark={isDark} label="Class" name="class" value={formData.class} onChange={handleChange} />
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

      {/* GUARDIAN */}
      <section className={sectionCls}>
        <h3 className={headingCls}>Parent / Guardian</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput isDark={isDark} label="Guardian Name" name="famillyFullName" value={formData.famillyFullName} onChange={handleChange} />
          <FormInput isDark={isDark} label="Relationship" name="Relationship" value={formData.Relationship} onChange={handleChange} />
          <FormInput isDark={isDark} label="Phone" name="familyPhone" value={formData.familyPhone} onChange={handleChange} />
          <FormInput isDark={isDark} label="Address" name="familyAddress" value={formData.familyAddress} onChange={handleChange} />
          <FormInput isDark={isDark} label="Woreda" name="familyWoreda" value={formData.familyWoreda} onChange={handleChange} />
          <FormInput isDark={isDark} label="Home Number" name="familyHomeNumber" value={formData.familyHomeNumber} onChange={handleChange} />
        </div>
      </section>

      {/* ACCOUNT */}
      <section className={sectionCls}>
        <h3 className={headingCls}>Account</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput isDark={isDark} label="Email" name="email" value={formData.email} onChange={handleChange} />
          {mode === "create" && (
            <FormInput isDark={isDark} label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
          )}
          <div>
            <label className={labelCls}>Role</label>
            <input value="Student" disabled className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Generate ID</label>
            <select name="generateId" value={formData.generateId ?? "skip"} onChange={handleChange} className={inputCls}>
              <option value="apply">Apply</option>
              <option value="skip">Skip</option>
            </select>
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section className={sectionCls}>
        <h3 className={headingCls}>Documents</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <FileUpload label="Student Photo" accept="image/*" file={studentPhoto}
            existingUrl={existingStudentPhoto}
            onChange={(e) => handleFileChange(e, "student")}
            onClear={() => setStudentPhoto(null)} isDark={isDark} />
          <FileUpload label="Family Photo" accept="image/*" file={familyPhoto}
            existingUrl={existingFamilyPhoto}
            onChange={(e) => handleFileChange(e, "family")}
            onClear={() => setFamilyPhoto(null)} isDark={isDark} />
          <FileUpload label="Other Document" accept=".jpg,.jpeg,.png,.pdf" file={otherDocument}
            existingUrl={existingOtherDocument}
            onChange={(e) => handleFileChange(e, "other")}
            onClear={() => setOtherDocument(null)} isDark={isDark} />
        </div>
      </section>

      {/* SUBMIT */}
      <button type="submit" disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "Loading..." : mode === "create" ? "Register Student" : "Update Student"}
      </button>
    </form>
  );
};

export default StudentForm;

/* ── Primitives ── */

const FormInput = ({ isDark, label, ...props }) => {
  const inputCls = `w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  } disabled:opacity-60`;
  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {label}
      </label>
      <input {...props} className={inputCls} />
    </div>
  );
};

/**
 * FileUpload — shows new file preview OR existing server URL, with replace/clear
 */
const FileUpload = ({ label, accept, file, existingUrl, onChange, onClear, isDark }) => {
  const isPdf = (src) =>
    typeof src === "string"
      ? src.toLowerCase().includes(".pdf")
      : src?.type === "application/pdf" || src?.name?.toLowerCase().endsWith(".pdf");

  const newPreview = file ? URL.createObjectURL(file) : null;
  const borderCls = isDark ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-white";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <div className={`border rounded-lg p-4 flex flex-col gap-3 ${borderCls}`}>
      {/* Label + upload trigger */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
        <label className="flex items-center gap-1 text-xs text-blue-500 cursor-pointer hover:underline">
          <FiUpload size={13} />
          {existingUrl || file ? "Replace" : "Upload"}
          <input type="file" hidden accept={accept} onChange={onChange} />
        </label>
      </div>

      {file ? (
        /* New file chosen */
        <div className="relative">
          {isPdf(file) ? (
            <a href={newPreview} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
              <FiExternalLink size={14} />{file.name}
            </a>
          ) : (
            <img src={newPreview} alt={label} className="w-full h-32 object-cover rounded" />
          )}
          <p className="text-xs text-green-500 mt-1 truncate">📄 {file.name}</p>
          <button type="button" onClick={onClear}
            className={`absolute top-1 right-1 rounded-full p-0.5 hover:text-red-500 ${isDark ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
            <FiX size={13} />
          </button>
        </div>
      ) : existingUrl ? (
        /* Existing server file */
        <div>
          {isPdf(existingUrl) ? (
            <a href={existingUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
              <FiExternalLink size={14} />View existing document
            </a>
          ) : (
            <img src={existingUrl} alt={label} className="w-full h-32 object-cover rounded" />
          )}
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Current file — upload to replace</p>
        </div>
      ) : (
        <p className={`text-xs text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No file selected</p>
      )}
    </div>
  );
};
