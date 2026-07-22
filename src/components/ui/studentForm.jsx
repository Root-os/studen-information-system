import React from "react";
import { FiUpload, FiExternalLink, FiX } from "react-icons/fi";

const StudentForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  mode = "create",
  // new file objects chosen by the user
  studentPhoto,
  setStudentPhoto,
  familyPhoto,
  setFamilyPhoto,
  otherDocument,
  setOtherDocument,
  // existing URLs from the server (edit mode)
  existingStudentPhoto,
  existingFamilyPhoto,
  existingOtherDocument,
}) => {
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "student") setStudentPhoto(file);
    if (type === "family") setFamilyPhoto(file);
    if (type === "other") setOtherDocument(file);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* ================= PERSONAL INFO ================= */}
      <section className="p-5 border rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} />
          <Input label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
          <Input label="Baptism Name" name="baptismaName" value={formData.baptismaName} onChange={handleChange} />
          <Input label="Confession Father" name="hollyFatherName" value={formData.hollyFatherName} onChange={handleChange} />
          <Input label="Father Phone" name="hollyFatherPhone" value={formData.hollyFatherPhone} onChange={handleChange} />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Input label="Education Level" name="educationLevel" value={formData.educationLevel} onChange={handleChange} />
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
          <Input label="SubCity" name="SubCity" value={formData.SubCity} onChange={handleChange} />
          <Input label="Woreda" name="woreda" value={formData.woreda} onChange={handleChange} />
          <Input label="Home Number" name="homeNumber" value={formData.homeNumber} onChange={handleChange} />
          <Input label="Class" name="class" value={formData.class} onChange={handleChange} />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={["ACTIVE", "INACTIVE"]}
          />
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={["student", "regullar", "unique_regular", "honorary_members"]}
          />
        </div>
      </section>

      {/* ================= GUARDIAN ================= */}
      <section className="p-5 border rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Parent / Guardian</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Guardian Name" name="famillyFullName" value={formData.famillyFullName} onChange={handleChange} />
          <Input label="Relationship" name="Relationship" value={formData.Relationship} onChange={handleChange} />
          <Input label="Phone" name="familyPhone" value={formData.familyPhone} onChange={handleChange} />
          <Input label="Address" name="familyAddress" value={formData.familyAddress} onChange={handleChange} />
          <Input label="Woreda" name="familyWoreda" value={formData.familyWoreda} onChange={handleChange} />
          <Input label="Home Number" name="familyHomeNumber" value={formData.familyHomeNumber} onChange={handleChange} />
        </div>
      </section>

      {/* ================= ACCOUNT ================= */}
      <section className="p-5 border rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Account</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
          {mode === "create" && (
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
          )}
          <Input label="Role" value="Student" disabled />
          <Select
            label="Generate ID"
            name="generateId"
            value={formData.generateId}
            onChange={handleChange}
            options={["apply", "skip"]}
          />
        </div>
      </section>

      {/* ================= DOCUMENTS ================= */}
      <section className="p-5 border rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Documents</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <FileUpload
            label="Student Photo"
            accept="image/*"
            file={studentPhoto}
            existingUrl={existingStudentPhoto}
            onChange={(e) => handleFileChange(e, "student")}
            onClear={() => setStudentPhoto(null)}
          />
          <FileUpload
            label="Family Photo"
            accept="image/*"
            file={familyPhoto}
            existingUrl={existingFamilyPhoto}
            onChange={(e) => handleFileChange(e, "family")}
            onClear={() => setFamilyPhoto(null)}
          />
          <FileUpload
            label="Other Document"
            accept=".jpg,.jpeg,.png,.pdf"
            file={otherDocument}
            existingUrl={existingOtherDocument}
            onChange={(e) => handleFileChange(e, "other")}
            onClear={() => setOtherDocument(null)}
          />
        </div>
      </section>

      {/* ================= SUBMIT ================= */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : mode === "create" ? "Register Student" : "Update Student"}
      </button>
    </form>
  );
};

export default StudentForm;

/* ── Reusable primitives ── */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
    <input
      {...props}
      className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-700"
    />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
    <select
      {...props}
      className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

/**
 * FileUpload card
 * - existingUrl: URL string of the file already saved on the server
 * - file:        new File object the user just selected
 * - Shows a thumbnail if the existing/new file is an image, or a link if PDF
 */
const FileUpload = ({ label, accept, file, existingUrl, onChange, onClear }) => {
  const isPdf = (src) => src?.toLowerCase().includes(".pdf") || src?.type === "application/pdf";
  const newPreview = file ? URL.createObjectURL(file) : null;
  const isNewPdf = file ? isPdf(file) : false;
  const isExistingPdf = isPdf(existingUrl);

  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 flex flex-col gap-3">
      {/* Label + upload button */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium dark:text-gray-300">{label}</span>
        <label className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
          <FiUpload size={13} />
          {existingUrl || file ? "Replace" : "Upload"}
          <input type="file" hidden accept={accept} onChange={onChange} />
        </label>
      </div>

      {/* Preview area */}
      {file ? (
        /* New file chosen — show preview */
        <div className="relative">
          {isNewPdf ? (
            <a
              href={newPreview}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FiExternalLink size={14} />
              {file.name}
            </a>
          ) : (
            <img
              src={newPreview}
              alt={label}
              className="w-full h-32 object-cover rounded border dark:border-gray-600"
            />
          )}
          <p className="text-xs text-green-500 mt-1 truncate">📄 {file.name}</p>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1 right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 text-gray-500 hover:text-red-500"
            title="Remove selection"
          >
            <FiX size={13} />
          </button>
        </div>
      ) : existingUrl ? (
        /* Existing file from server */
        <div>
          {isExistingPdf ? (
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FiExternalLink size={14} />
              View existing document
            </a>
          ) : (
            <img
              src={existingUrl}
              alt={label}
              className="w-full h-32 object-cover rounded border dark:border-gray-600"
            />
          )}
          <p className="text-xs text-gray-400 mt-1">Current file — upload to replace</p>
        </div>
      ) : (
        /* Nothing yet */
        <p className="text-xs text-gray-400 text-center py-4">No file selected</p>
      )}
    </div>
  );
};
