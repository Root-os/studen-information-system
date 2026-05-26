import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import ThemeContext from "../../components/layout/ThemeContext";
import api from "../../hooks/api";

const StudentDetail = () => {
  const { id } = useParams();
  const { currentTheme } = useContext(ThemeContext);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  const isDark = currentTheme === "dark";

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setStudent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!student) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-6xl">

        {/* Top Navigation / Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              } shadow-sm hover:shadow-md`}
          >
            <ArrowBack fontSize="small" />
            <span className="font-medium">Back to Students</span>
          </button>
        </div>

        {/* Document Card */}
        <div
          className={`rounded-lg shadow-lg p-10 ${
            isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold">
              Student Registration Record
            </h1>
            <p className="text-sm opacity-70">
              Official Student Information Document
            </p>
          </div>

          {/* Top Photos */}
          <div className="flex justify-between mb-10">
            <img
              src={student.studentPhoto}
              alt="Student"
              className="w-36 h-36 object-cover border rounded-md"
            />
            <img
              src={student.familyPhoto}
              alt="Family"
              className="w-36 h-36 object-cover border rounded-md"
            />
          </div>

          {/* Student Information */}
          <Section title="Student Information">
            <Grid>
              <Info label="Full Name" value={student.fullName} />
              <Info label="Email" value={student.email} />
              <Info label="Phone" value={student.phone} />
              <Info label="Date of Birth" value={student.date_of_birth} />
              <Info label="Baptisma Name" value={student.baptismaName} />
              <Info label="Education Level" value={student.educationLevel} />
              <Info label="Class" value={student.class} />
              <Info label="Status" value={student.status} />
            </Grid>
          </Section>

          {/* Address Information */}
          <Section title="Address Information">
            <Grid>
              <Info label="Address" value={student.address} />
              <Info label="Sub City" value={student.SubCity} />
              <Info label="Woreda" value={student.woreda} />
              <Info label="Home Number" value={student.homeNumber} />
            </Grid>
          </Section>

          {/* Family Information */}
          <Section title="Family Information">
            <Grid>
              <Info label="Family Full Name" value={student.famillyFullName} />
              <Info label="Relationship" value={student.Relationship} />
              <Info label="Family Phone" value={student.familyPhone} />
              <Info label="Family Address" value={student.familyAddress} />
              <Info label="Family Sub City" value={student.familySubCity} />
              <Info label="Family Woreda" value={student.familyWoreda} />
            </Grid>
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <Grid>
              <Info label="Holy Father Name" value={student.hollyFatherName} />
              <Info label="Holy Father Phone" value={student.hollyFatherPhone} />
              <Info label="Registered Date" value={student.registeredDate} />
            </Grid>
          </Section>

          {/* Approval Section */}
          <div className="mt-12 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Approval</h3>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-sm opacity-70">Approved By</p>
                <p className="font-medium">
                  {student.approvedBy || "Pending Approval"}
                </p>
              </div>

              <div>
                <p className="text-sm opacity-70">Approved Date</p>
                <p className="font-medium">
                  {student.approvedDate || "-"}
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <div className="border-t w-48 mb-2"></div>
                <p className="text-sm">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Section Title */
const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-lg font-semibold border-b pb-2 mb-6">{title}</h2>
    {children}
  </div>
);

/* Grid Layout */
const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-6">{children}</div>
);

/* Field */
const Info = ({ label, value }) => (
  <div>
    <p className="text-sm opacity-70">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

export default StudentDetail;