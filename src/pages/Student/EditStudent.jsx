import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../hooks/api";
import StudentForm from "../../components/ui/studentForm";
// import { useToast } from "../../components/ui/toast";
// import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import StatusModal from "../../components/ui/successModal";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
//   const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  //   const navigate = useNavigate();

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

  const [files, setFiles] = useState({
    studentPhoto: null,
    familyPhoto: null,
    otherDocument: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    studentPhoto: null,
    familyPhoto: null,
    otherDocument: null,
  });

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

  // 1. FETCH STUDENT
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true);

        const res = await api.get(`/users/${id}`);
        const student = res.data;

        setFormData({
          fullName: student.fullName || "",
          date_of_birth: student.date_of_birth || "",
          baptismaName: student.baptismaName || "",
          hollyFatherName: student.hollyFatherName || "",
          hollyFatherPhone: student.hollyFatherPhone || "",
          address: student.address || "",
          SubCity: student.SubCity || "",
          woreda: student.woreda || "",
          homeNumber: student.homeNumber || "",
          educationLevel: student.educationLevel || "",
          phone: student.phone || "",
          famillyFullName: student.famillyFullName || "",
          Relationship: student.Relationship || "",
          familyAddress: student.familyAddress || "",
          familyWoreda: student.familyWoreda || "",
          familySubCity: student.familySubCity || "",
          familyHomeNumber: student.familyHomeNumber || "",
          familyPhone: student.familyPhone || "",
          class: student.class || "",
          status: student.status || "ACTIVE",
          category: student.category || "student",
          email: student.email || "",
        });

        setExistingFiles({
          studentPhoto: student.studentPhoto || null,
          familyPhoto: student.familyPhoto || null,
          otherDocument: student.otherDocument || null,
        });
      } catch (err) {
        console.error(err);
        // error("Failed to load student data");
        showStatus(
          "error",
          "Load Failed",
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load student data",
        );
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id]);

  // 2. UPDATE STUDENT
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (files.studentPhoto) data.append("studentPhoto", files.studentPhoto);
      if (files.familyPhoto) data.append("familyPhoto", files.familyPhoto);
      if (files.otherDocument)
        data.append("otherDocument", files.otherDocument);

      await api.put(`/users/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      //   success("Student updated successfully");
      showStatus(
        "success",
        "Update Successful",
        "Student updated successfully",
      );
      //   navigate("/students");
    } catch (err) {
      console.error(err);
      //   error("Update failed");
      showStatus(
        "error",
        "Update Failed",
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong while updating student",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading student...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Student</h1>

      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className={
            `flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200`
            //   ${
            //     isDark
            //       ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
            //       : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            //   } shadow-sm hover:shadow-md`
          }
        >
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
        studentPhoto={files.studentPhoto}
        setStudentPhoto={(file) =>
          setFiles((prev) => ({ ...prev, studentPhoto: file }))
        }
        familyPhoto={files.familyPhoto}
        setFamilyPhoto={(file) =>
          setFiles((prev) => ({ ...prev, familyPhoto: file }))
        }
        otherDocument={files.otherDocument}
        setOtherDocument={(file) =>
          setFiles((prev) => ({ ...prev, otherDocument: file }))
        }
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
