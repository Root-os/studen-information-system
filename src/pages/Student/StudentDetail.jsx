import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { FiExternalLink, FiFileText, FiDownload, FiX, FiMaximize2 } from "react-icons/fi";
import ThemeContext from "../../components/layout/ThemeContext";
import api from "../../hooks/api";

const StudentDetail = () => {
  const { id } = useParams();
  const { currentTheme } = useContext(ThemeContext);
  const [student, setStudent] = useState(null);
  const [approvedByName, setApprovedByName] = useState(null); // name of the approving user
  const [docOpen, setDocOpen] = useState(false);
  const navigate = useNavigate();

  const isDark = currentTheme === "dark";

  useEffect(() => { fetchStudent(); }, [id]);

  // Close viewer on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDocOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setStudent(res.data);

      // If approvedBy is a numeric user id, look up their name
      const approvedById = res.data?.approvedBy;
      if (approvedById && !isNaN(Number(approvedById))) {
        try {
          const userRes = await api.get(`/users/${approvedById}`);
          setApprovedByName(userRes.data?.fullName ?? null);
        } catch {
          setApprovedByName(null);
        }
      } else {
        // Legacy: approvedBy is already a name string
        setApprovedByName(approvedById || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!student) return (
    <div className={`p-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Loading...</div>
  );

  const isPdf = (url) => url?.toLowerCase().endsWith(".pdf");
  const docUrl = student.otherDocument;
  const displayApprovedBy = approvedByName || "Pending Approval";

  const cardCls = `rounded-lg shadow-lg p-10 ${isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}`;
  const sectionTitleCls = `text-lg font-semibold border-b pb-2 mb-6 ${isDark ? "border-gray-700 text-gray-100" : "border-gray-200 text-gray-800"}`;
  const subLabelCls = `text-sm opacity-70`;
  const valueCls = `font-medium ${isDark ? "text-gray-100" : "text-gray-800"}`;

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-6xl">

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

        {/* Main card */}
        <div className={cardCls}>

          {/* Header */}
          <div className={`text-center mb-8 border-b pb-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Student Registration Record
            </h1>
            <p className={`text-sm mt-1 opacity-70`}>Official Student Information Document</p>
          </div>

          {/* Photos */}
          <div className="flex justify-between items-start mb-10 gap-4 flex-wrap">
            <PhotoCard label="Student Photo" url={student.studentPhoto} isDark={isDark} />
            <PhotoCard label="Family Photo" url={student.familyPhoto} isDark={isDark} />
          </div>

          {/* Student Information */}
          <div className="mb-10">
            <h2 className={sectionTitleCls}>Student Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Full Name" value={student.fullName} isDark={isDark} />
              <Info label="Email" value={student.email} isDark={isDark} />
              <Info label="Phone" value={student.phone} isDark={isDark} />
              <Info label="Date of Birth" value={student.date_of_birth} isDark={isDark} />
              <Info label="Baptisma Name" value={student.baptismaName} isDark={isDark} />
              <Info label="Education Level" value={student.educationLevel} isDark={isDark} />
              <Info label="Class" value={student.class} isDark={isDark} />
              <Info label="Category" value={student.category} isDark={isDark} />
              <Info label="Status" value={student.status} isDark={isDark} />
              {student.studentId && <Info label="Student ID" value={student.studentId} isDark={isDark} />}
            </div>
          </div>

          {/* Address */}
          <div className="mb-10">
            <h2 className={sectionTitleCls}>Address Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Address" value={student.address} isDark={isDark} />
              <Info label="Sub City" value={student.SubCity} isDark={isDark} />
              <Info label="Woreda" value={student.woreda} isDark={isDark} />
              <Info label="Home Number" value={student.homeNumber} isDark={isDark} />
            </div>
          </div>

          {/* Family */}
          <div className="mb-10">
            <h2 className={sectionTitleCls}>Family Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Family Full Name" value={student.famillyFullName} isDark={isDark} />
              <Info label="Relationship" value={student.Relationship} isDark={isDark} />
              <Info label="Family Phone" value={student.familyPhone} isDark={isDark} />
              <Info label="Family Address" value={student.familyAddress} isDark={isDark} />
              <Info label="Family Sub City" value={student.familySubCity} isDark={isDark} />
              <Info label="Family Woreda" value={student.familyWoreda} isDark={isDark} />
            </div>
          </div>

          {/* Additional */}
          <div className="mb-10">
            <h2 className={sectionTitleCls}>Additional Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <Info label="Holy Father Name" value={student.hollyFatherName} isDark={isDark} />
              <Info label="Holy Father Phone" value={student.hollyFatherPhone} isDark={isDark} />
              <Info label="Registered Date" value={student.registeredDate} isDark={isDark} />
            </div>
          </div>

          {/* Other Document */}
          {docUrl && (
            <div className="mb-10">
              <h2 className={sectionTitleCls}>Other Document</h2>
              <div className={`flex items-center gap-4 p-4 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                {isPdf(docUrl) ? (
                  <div className={`w-16 h-16 flex items-center justify-center rounded-md ${isDark ? "bg-gray-700" : "bg-red-50"}`}>
                    <FiFileText size={28} className="text-red-500" />
                  </div>
                ) : (
                  <img src={docUrl} alt="Other Document"
                    className="w-16 h-16 object-cover rounded-md border dark:border-gray-600 cursor-pointer"
                    onClick={() => setDocOpen(true)} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {isPdf(docUrl) ? "PDF Document" : "Image Document"}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5">{docUrl.split("/").pop()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setDocOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                    <FiMaximize2 size={13} />View
                  </button>
                  <a href={docUrl} download target="_blank" rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}>
                    <FiDownload size={13} />Download
                  </a>
                  <a href={docUrl} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}>
                    <FiExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Approval + Signature */}
          <div className={`mt-4 border-t pt-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
              Approval
            </h3>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className={subLabelCls}>Approved By</p>
                <p className={valueCls}>{displayApprovedBy}</p>
              </div>
              <div>
                <p className={subLabelCls}>Approved Date</p>
                <p className={valueCls}>{student.approvedDate || "-"}</p>
              </div>
            </div>

            {/* Signature line — shows the approving user's name */}
            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <p className={`font-medium text-sm mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {displayApprovedBy}
                </p>
                <div className={`border-t w-48 mb-2 ${isDark ? "border-gray-500" : "border-gray-400"}`} />
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Document Viewer Modal */}
      {docOpen && docUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={(e) => { if (e.target === e.currentTarget) setDocOpen(false); }}>
          <div className="flex items-center justify-between px-5 py-3 bg-black/60 shrink-0">
            <p className="text-white text-sm font-medium truncate max-w-xs">{docUrl.split("/").pop()}</p>
            <div className="flex items-center gap-3">
              <a href={docUrl} download target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-white/10 hover:bg-white/20 text-white transition-colors">
                <FiDownload size={14} />Download
              </a>
              <a href={docUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-white/10 hover:bg-white/20 text-white transition-colors">
                <FiExternalLink size={14} />Open in new tab
              </a>
              <button onClick={() => setDocOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-white/10 hover:bg-red-600 text-white transition-colors">
                <FiX size={14} />Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {isPdf(docUrl) ? (
              <iframe src={docUrl} title="Document Viewer"
                className="w-full max-w-4xl h-full min-h-[75vh] rounded-lg bg-white" />
            ) : (
              <img src={docUrl} alt="Document" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Sub-components ── */

const Info = ({ label, value, isDark }) => (
  <div>
    <p className={`text-sm opacity-70 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
    <p className={`font-medium ${isDark ? "text-gray-100" : "text-gray-800"}`}>{value || "-"}</p>
  </div>
);

const PhotoCard = ({ label, url, isDark }) => (
  <div className="flex flex-col items-center gap-2">
    {url ? (
      <img src={url} alt={label} className="w-36 h-36 object-cover border rounded-md dark:border-gray-600" />
    ) : (
      <div className={`w-36 h-36 flex items-center justify-center border rounded-md text-xs text-center px-2 ${
        isDark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-300 text-gray-400"
      }`}>
        No photo
      </div>
    )}
    <span className={`text-xs opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
  </div>
);

export default StudentDetail;
