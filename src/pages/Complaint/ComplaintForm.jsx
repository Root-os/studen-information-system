import React, { useEffect, useState, useCallback, useContext } from "react";
import api from "../../hooks/api";
import { AuthContext } from "../../contexts/AuthContext";

const ALL_FLOWS = [
  { value: "student_to_student", label: "Student → Student", complainantType: "student", respondantType: "student" },
  { value: "student_to_teacher", label: "Student → Teacher", complainantType: "student", respondantType: "teacher" },
  { value: "teacher_to_student", label: "Teacher → Student", complainantType: "teacher", respondantType: "student" },
];

const inputCls = (isDark) =>
  `w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"
  }`;

const labelCls = (isDark) =>
  `block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

const ComplaintForm = ({ isDark, themeBtn, onClose, onSaved, initialData = null }) => {
  const { user } = useContext(AuthContext);

  // Case-insensitive role resolution
  const userRoleStr = (
    typeof user?.role === "object"
      ? user?.role?.name
      : typeof user?.role === "string"
      ? user?.role
      : ""
  ).toLowerCase().trim();

  const isTeacherUser = userRoleStr === "teacher";
  const isStudentUser = userRoleStr === "student";
  const isOtherRole = !isTeacherUser && !isStudentUser;

  // Determine allowed flows per role
  let allowedFlows = ALL_FLOWS;
  if (isTeacherUser) {
    allowedFlows = ALL_FLOWS.filter((f) => f.value === "teacher_to_student");
  } else if (isStudentUser) {
    allowedFlows = ALL_FLOWS.filter((f) => f.value === "student_to_student" || f.value === "student_to_teacher");
  }

  const isEditing = Boolean(initialData?.id);

  // Default flow initialization
  const initialFlow = allowedFlows.find((f) => f.value === initialData?.category) || allowedFlows[0];
  const [flow, setFlow] = useState(initialFlow);

  const [classes, setClasses] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);

  // Filtered lists for admin/other roles
  const [classStudents, setClassStudents] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [loadingClassParties, setLoadingClassParties] = useState(false);

  const [respondants, setRespondants] = useState({ students: [], teachers: [] });
  const [loadingRespondants, setLoadingRespondants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    complainant: initialData?.complainant
      ? String(initialData.complainant)
      : (isTeacherUser || isStudentUser) && user?.id
      ? String(user.id)
      : "",
    respondant: initialData?.respondant ? String(initialData.respondant) : "",
    classId: initialData?.classId ? String(initialData.classId) : "",
    academicYearId: initialData?.academicYearId ? String(initialData.academicYearId) : "",
    complaint: initialData?.complaint || "",
  });

  // Load classes & auto-detect current academic year on mount
  useEffect(() => {
    if (isEditing) return;

    api.get("/class")
      .then((r) => setClasses(r.data?.data ?? r.data ?? []))
      .catch(() => {});

    api.get("/academicYear")
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        const active = list.find((y) => y.isCurrent) || list[0];
        if (active) {
          setCurrentYear(active);
          setForm((prev) => ({ ...prev, academicYearId: String(active.id) }));
        }
      })
      .catch(() => {});
  }, [isEditing]);

  // Autofill complainant for teacher or student accounts
  useEffect(() => {
    if (!isEditing && (isTeacherUser || isStudentUser) && user?.id) {
      setForm((prev) => ({ ...prev, complainant: String(user.id) }));
    }
  }, [isTeacherUser, isStudentUser, user, isEditing]);

  // Fetch class members for admin/user selection directly from Enrollment table
  const fetchPartiesForClass = useCallback(async (classId) => {
    if (!classId) {
      setClassStudents([]);
      setClassTeachers([]);
      return;
    }
    setLoadingClassParties(true);
    try {
      const [studRes, teachRes] = await Promise.allSettled([
        api.get(`/enrollment/class/${classId}`),
        api.get(`/courseAssign/class/${classId}/teachers`),
      ]);

      let students = [];

      if (studRes.status === "fulfilled" && studRes.value.data) {
        const resData = studRes.value.data;
        if (resData.data && Array.isArray(resData.data) && resData.data.length > 0) {
          students = resData.data.map((e) => ({
            id: e.studentId || e.id,
            fullName: e.fullName || `Student #${e.studentId}`,
            phone: e.phone || "",
          }));
        } else if (Array.isArray(resData) && resData.length > 0) {
          students = resData.map((e) => ({
            id: e.studentId || e.User?.id || e.id,
            fullName: e.User?.fullName || e.fullName || `Student #${e.studentId}`,
            phone: e.User?.phone || e.phone || "",
          }));
        }
      }

      // Fallback: If getStudentsByClass returns empty or fails, query /enrollments directly
      if (students.length === 0) {
        try {
          const allEnrollmentsRes = await api.get("/enrollments");
          const list = allEnrollmentsRes.data?.data || allEnrollmentsRes.data || [];
          const classEnrollments = list.filter((e) => String(e.classId) === String(classId) || String(e.Class?.id) === String(classId));
          students = classEnrollments.map((e) => ({
            id: e.studentId || e.User?.id,
            fullName: e.User?.fullName || e.student?.fullName || `Student #${e.studentId}`,
            phone: e.User?.phone || "",
          })).filter((s) => Boolean(s.id));
        } catch {
          // ignore fallback error
        }
      }

      setClassStudents(students);

      if (teachRes.status === "fulfilled") {
        const data = teachRes.value.data;
        const teachers = data?.data ? data.data : Array.isArray(data) ? data : [];
        setClassTeachers(teachers);
      } else {
        setClassTeachers([]);
      }
    } catch {
      setClassStudents([]);
      setClassTeachers([]);
    } finally {
      setLoadingClassParties(false);
    }
  }, []);

  // Handle class selection
  const handleClassChange = (classId) => {
    setForm((prev) => ({
      ...prev,
      classId,
      complainant: (isTeacherUser || isStudentUser) && user?.id ? String(user.id) : "",
      respondant: "",
    }));
    setRespondants({ students: [], teachers: [] });
    if (classId) {
      fetchPartiesForClass(classId);
    } else {
      setClassStudents([]);
      setClassTeachers([]);
    }
  };

  // Reset respondant when category flow changes
  useEffect(() => {
    if (isEditing) return;
    if (isOtherRole) {
      setForm((prev) => ({ ...prev, complainant: "", respondant: "" }));
      setRespondants({ students: [], teachers: [] });
    } else {
      setForm((prev) => ({ ...prev, respondant: "" }));
    }
  }, [flow, isEditing, isOtherRole]);

  // Respondant lookup API call
  const loadRespondants = useCallback(async (complainant, classId, academicYearId, complainantType) => {
    if (!complainant || !classId || !academicYearId) {
      setRespondants({ students: [], teachers: [] });
      return;
    }
    try {
      setLoadingRespondants(true);
      const res = await api.get("/complaints/lookup/respondants", {
        params: { complainantId: complainant, complainantType, classId, academicYearId },
      });
      setRespondants(res.data);
    } catch {
      setRespondants({ students: [], teachers: [] });
    } finally {
      setLoadingRespondants(false);
    }
  }, []);

  // Trigger respondant lookup whenever complainant, class, or year changes
  useEffect(() => {
    if (isEditing) return;
    if (form.complainant && form.classId && form.academicYearId) {
      loadRespondants(form.complainant, form.classId, form.academicYearId, flow.complainantType);
    } else {
      setRespondants({ students: [], teachers: [] });
    }
  }, [form.complainant, form.classId, form.academicYearId, flow.complainantType, loadRespondants, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (isEditing) {
      if (!form.complaint.trim()) {
        setFormError("Complaint description cannot be empty.");
        return;
      }
      try {
        setSubmitting(true);
        await api.put(`/complaints/${initialData.id}`, {
          complaint: form.complaint.trim(),
        });
        onSaved("Complaint updated successfully!");
      } catch (err) {
        setFormError(err?.response?.data?.message ?? "Failed to update complaint.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!form.complainant || !form.respondant || !form.classId || !form.academicYearId || !form.complaint.trim()) {
      setFormError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/complaints", {
        complainant: Number(form.complainant),
        complainantType: flow.complainantType,
        respondant: Number(form.respondant),
        respondantType: flow.respondantType,
        classId: Number(form.classId),
        academicYearId: Number(form.academicYearId),
        complaint: form.complaint.trim(),
      });
      onSaved("Complaint filed successfully!");
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Failed to file complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const complainantOptions = flow.complainantType === "student" ? classStudents : classTeachers;

  // Respondent list based on class members (Enrollment table for students, CourseAssignment for teachers)
  const classBaseRespondants = flow.respondantType === "student" ? classStudents : classTeachers;
  const apiLookupRespondants = flow.respondantType === "student" ? respondants.students : respondants.teachers;
  const rawRespondantList = apiLookupRespondants.length > 0 ? apiLookupRespondants : classBaseRespondants;

  // Filter out complainant from respondent options if same party type
  const respondantOptions = rawRespondantList.filter((p) => {
    if (flow.complainantType === flow.respondantType && form.complainant) {
      return String(p.id) !== String(form.complainant);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh] border ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {isEditing ? `Edit Complaint (ID #${initialData.id})` : "File a Complaint"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded px-3 py-2 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300">
              {formError}
            </div>
          )}

          {!isEditing ? (
            <>
              {/* Category Flow Selector */}
              <div>
                <label className={labelCls(isDark)}>Complaint Category</label>
                {allowedFlows.length === 1 ? (
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded px-3 py-2">
                    {allowedFlows[0].label} (Pre-selected for {userRoleStr || "your"} account)
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {allowedFlows.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFlow(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          flow.value === f.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : isDark
                            ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Academic Year */}
              <div>
                <label className={labelCls(isDark)}>Academic Year</label>
                <div className={`px-3 py-2 rounded border text-sm font-medium ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-800"}`}>
                  {currentYear ? `${currentYear.yearName} (Current Academic Year)` : "Loading current academic year..."}
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className={labelCls(isDark)}>Select Class</label>
                <select
                  className={inputCls(isDark)}
                  value={form.classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <option value="">Select class...</option>
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>{cl.className}</option>
                  ))}
                </select>
              </div>

              {/* Complainant Selection */}
              <div>
                <label className={labelCls(isDark)}>
                  Complainant ({flow.complainantType === "student" ? "Student" : "Teacher"})
                  {loadingClassParties && <span className="ml-2 text-blue-400 text-xs">Loading class members...</span>}
                </label>

                {isTeacherUser || isStudentUser ? (
                  <input
                    type="text"
                    disabled
                    value={user?.fullName ? `${user.fullName} (${user.studentId || user.userName || user.email || ""})` : `${flow.complainantType} ID #${user?.id}`}
                    className={`${inputCls(isDark)} opacity-80 cursor-not-allowed`}
                  />
                ) : (
                  <select
                    className={inputCls(isDark)}
                    value={form.complainant}
                    disabled={!form.classId || complainantOptions.length === 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({ ...prev, complainant: val, respondant: "" }));
                    }}
                  >
                    <option value="">
                      {!form.classId
                        ? "Select class first..."
                        : complainantOptions.length === 0
                        ? `No ${flow.complainantType}s found in this class`
                        : `Select ${flow.complainantType} from this class...`}
                    </option>
                    {complainantOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}{item.phone ? ` (${item.phone})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Respondant Selection */}
              <div>
                <label className={labelCls(isDark)}>
                  Respondant ({flow.respondantType === "student" ? "Student" : "Teacher"})
                  {loadingRespondants && <span className="ml-2 text-blue-400 text-xs">Filtering respondants...</span>}
                </label>
                <select
                  className={inputCls(isDark)}
                  value={form.respondant}
                  disabled={!form.classId || respondantOptions.length === 0}
                  onChange={(e) => setForm((prev) => ({ ...prev, respondant: e.target.value }))}
                >
                  <option value="">
                    {!form.classId
                      ? "Select class first..."
                      : respondantOptions.length === 0
                      ? `No ${flow.respondantType}s found in this class`
                      : `Select ${flow.respondantType} from this class...`}
                  </option>
                  {respondantOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}{p.studentId ? ` (${p.studentId})` : ""}{p.userName ? ` (@${p.userName})` : ""}{p.phone ? ` (${p.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <p><strong className={isDark ? "text-white" : "text-gray-900"}>Category:</strong> {initialData.category}</p>
              <p><strong className={isDark ? "text-white" : "text-gray-900"}>Class:</strong> {initialData.complainClass?.className || initialData.classId}</p>
              <p><strong className={isDark ? "text-white" : "text-gray-900"}>Academic Year:</strong> {initialData.complainAcademicYear?.yearName || initialData.academicYearId}</p>
            </div>
          )}

          {/* Complaint Description */}
          <div>
            <label className={labelCls(isDark)}>Complaint Description</label>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Describe the complaint in detail..."
              className={inputCls(isDark)}
              value={form.complaint}
              onChange={(e) => setForm((prev) => ({ ...prev, complaint: e.target.value }))}
            />
            <p className={`text-xs text-right mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {form.complaint.length} / 2000
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`pt-4 border-t flex justify-end gap-3 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded text-sm text-white font-medium disabled:opacity-50 ${themeBtn}`}
            >
              {submitting ? (isEditing ? "Saving..." : "Filing...") : isEditing ? "Update Complaint" : "File Complaint"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
