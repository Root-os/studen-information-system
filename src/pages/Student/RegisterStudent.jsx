import React, { useState, useContext, useEffect } from "react";
import { FiUpload, FiExternalLink, FiX } from "react-icons/fi";
import api from "../../hooks/api";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/toast";

const RegisterStudent = () => {
  const { token } = useContext(AuthContext);
  const { success, error } = useToast();

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
    approvedBy: "",
    approvedDate: today,
    email: "",
    password: "",
    roleId: "",
  });

  const [studentPhoto, setStudentPhoto] = useState(null);
  const [familyPhoto, setFamilyPhoto] = useState(null);
  const [otherDocument, setOtherDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [roles, setRoles] = useState([]);

  // Update approvedBy whenever token becomes available / changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const adminName = decoded.fullName || "Unknown Admin";

        setFormData((prev) => ({
          ...prev,
          approvedBy: adminName,
        }));

        // Optional: log for debugging
        console.log("Admin name set from token:", adminName);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setFormData((prev) => ({
          ...prev,
          approvedBy: "Decode Error",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        approvedBy: "",
      }));
    }
  }, [token]);

  useEffect(() => {
const fetchRoles = async () => {
    const res = await api.get("/role");

    const studentRole = res.data.data.find(
        role => role.name.toLowerCase() === "student"
    );

    if (studentRole) {
        setFormData(prev => ({
            ...prev,
            roleId: studentRole.id
        }));
    }
};

    fetchRoles();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, type) => {
    if (e.target.files?.length > 0) {
      if (type === "student") setStudentPhoto(e.target.files[0]);
      else if (type === "family") setFamilyPhoto(e.target.files[0]);
      else if (type === "other") setOtherDocument(e.target.files[0]);
    }
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

      success("Student Registered successfully");

      // Reset user-entered fields only
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        password: "",
        // approvedBy stays as-is (from token)
        // approvedDate stays as today's date or you can update it
      }));

      setStudentPhoto(null);
      setFamilyPhoto(null);
      setOtherDocument(null);
    } catch (err) {
      console.error(err);
      error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold dark:text-gray-200">
          Sunday School Student Registration
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ethiopian Orthodox Tewahedo Church
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <section className="p-5 border rounded dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Baptism Name
              </label>
              <input
                type="text"
                name="baptismaName"
                value={formData.baptismaName}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Confession Father
              </label>
              <input
                type="text"
                name="hollyFatherName"
                value={formData.hollyFatherName}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Confession Father Phone
              </label>
              <input
                type="text"
                name="hollyFatherPhone"
                value={formData.hollyFatherPhone}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Education Level
              </label>
              <input
                type="text"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Student Address */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                SubCity
              </label>
              <input
                type="text"
                name="SubCity"
                value={formData.SubCity}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Woreda
              </label>
              <input
                type="text"
                name="woreda"
                value={formData.woreda}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Home Number
              </label>
              <input
                type="text"
                name="homeNumber"
                value={formData.homeNumber}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Class
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category || "student"}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="student">Student</option>
                <option value="regullar">Regular</option>
                <option value="unique_regular">Unique Regular</option>
                <option value="honorary_members">Honorary Members</option>
              </select>
            </div>
          </div>
        </section>

        {/* Parent / Guardian Info */}
        <section className="p-5 border rounded dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
            Parent / Guardian Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Guardian Name
              </label>
              <input
                name="famillyFullName"
                value={formData.famillyFullName}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Relationship
              </label>
              <input
                name="Relationship"
                value={formData.Relationship}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Guardian Phone
              </label>
              <input
                name="familyPhone"
                value={formData.familyPhone}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Family Address
              </label>
              <input
                name="familyAddress"
                value={formData.familyAddress}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Family SubCity
              </label>
              <input
                name="familySubCity"
                value={formData.familySubCity}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Family Woreda
              </label>
              <input
                name="familyWoreda"
                value={formData.familyWoreda}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Family Home Number
              </label>
              <input
                name="familyHomeNumber"
                value={formData.familyHomeNumber}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="p-5 border rounded dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
            Account Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Role
              </label>

              <input
                value="Student"
                readOnly
                className="mt-1 border rounded px-3 py-2 w-full bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Generate Student ID
              </label>
              <select
                name="generateId"
                value={formData.generateId || "skip"}
                onChange={handleChange}
                className="mt-1 border rounded px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="apply">Apply</option>
                <option value="skip">Skip</option>
              </select>
            </div>
          </div>
        </section>

        {/* Approval Section */}
        <section className="p-5 border rounded dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
            Approval
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Approved By
              </label>
              <input
                value={formData.approvedBy}
                readOnly
                className="mt-1 border rounded px-3 py-2 w-full bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">
                Approved Date
              </label>
              <input
                type="date"
                value={formData.approvedDate}
                readOnly
                className="mt-1 border rounded px-3 py-2 w-full bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>
        </section>

        {/* File Upload */}
        <section className="p-5 border rounded dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Documents</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <FileUpload
              label="Student Photo"
              accept="image/*"
              file={studentPhoto}
              onChange={(e) => handleFileChange(e, "student")}
              onClear={() => setStudentPhoto(null)}
            />
            <FileUpload
              label="Family Photo"
              accept="image/*"
              file={familyPhoto}
              onChange={(e) => handleFileChange(e, "family")}
              onClear={() => setFamilyPhoto(null)}
            />
            <FileUpload
              label="Other Document"
              accept=".jpg,.jpeg,.png,.pdf"
              file={otherDocument}
              onChange={(e) => handleFileChange(e, "other")}
              onClear={() => setOtherDocument(null)}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
};

export default RegisterStudent;

/* ── File upload card (same design as studentForm) ── */
const FileUpload = ({ label, accept, file, onChange, onClear }) => {
  const isPdf = (f) => f?.type === "application/pdf" || f?.name?.toLowerCase().endsWith(".pdf");
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 flex flex-col gap-3">
      {/* Label + upload trigger */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium dark:text-gray-300">{label}</span>
        <label className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
          <FiUpload size={13} />
          {file ? "Replace" : "Upload"}
          <input type="file" hidden accept={accept} onChange={onChange} />
        </label>
      </div>

      {/* Preview */}
      {file ? (
        <div className="relative">
          {isPdf(file) ? (
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FiExternalLink size={14} />
              {file.name}
            </a>
          ) : (
            <img
              src={preview}
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
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">No file selected</p>
      )}
    </div>
  );
};
