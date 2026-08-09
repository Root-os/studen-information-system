import React, { useEffect, useState, useContext, useCallback } from "react";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import { FiEdit, FiTrash2, FiEye, FiCheckSquare } from "react-icons/fi";
import ThemeContext from "../../components/layout/ThemeContext";
import { useToast } from "../../components/ui/toast";
import { AuthContext } from "../../contexts/AuthContext";
import ComplaintForm from "./ComplaintForm";
import {
  StatusBadge,
  CategoryBadge,
  StatsBar,
  StatusUpdateModal,
  ComplaintDetailModal,
} from "./ComplaintComponents";
import type { ComplaintRecord, ComplaintStats, Status } from "./complainTypes";
import { getPartyName } from "./complainTypes";

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputCls = (isDark: boolean) =>
  `w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  }`;

const labelCls = (isDark: boolean) =>
  `block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// ─── Admin View ───────────────────────────────────────────────────────────────

const AdminView: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { theme } = useContext(ThemeContext);
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0,
  });
  const [classes, setClasses] = useState<Array<{ id: number; className: string }>>([]);
  const [years, setYears] = useState<Array<{ id: number; yearName: string }>>([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<ComplaintRecord | null>(null);
  const [selectedForStatus, setSelectedForStatus] = useState<ComplaintRecord | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<ComplaintRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/complaints/stats/summary");
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      if (filterClass) params.classId = filterClass;
      if (filterYear) params.academicYearId = filterYear;
      if (searchQuery.trim()) params.q = searchQuery.trim();
      const res = await api.get("/complaints", { params });
      setComplaints(res.data);
    } catch { error("Failed to fetch complaints"); }
  }, [filterStatus, filterCategory, filterClass, filterYear, searchQuery, error]);

  useEffect(() => {
    api.get("/class").then((r) => setClasses(r.data?.data ?? r.data ?? [])).catch(() => {});
    api.get("/academicYear").then((r) => setYears(r.data?.data ?? r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => { fetchStats(); fetchComplaints(); }, [fetchStats, fetchComplaints]);

  const handleSaved = (msg?: string) => {
    setShowFormModal(false);
    setEditingComplaint(null);
    if (msg) success(msg);
    fetchComplaints(); fetchStats();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/complaints/${confirmDelete}`);
      success("Complaint deleted");
      setConfirmDelete(null);
      fetchComplaints(); fetchStats();
    } catch { error("Failed to delete complaint"); }
  };

  const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const filterInputCls = `px-3 py-1.5 rounded border text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
  }`;

  const columns = [
    { header: "#", accessor: "rowNumber", render: (_: any, i: number) => i + 1 },
    {
      header: "Complainant", accessor: "complainant",
      render: (row: ComplaintRecord) => (
        <div>
          <div className="font-medium">{getPartyName(row, "complainant")}</div>
          <div className="text-xs text-gray-500 capitalize">{row.complainantType}</div>
        </div>
      ),
    },
    {
      header: "Respondent", accessor: "respondant",
      render: (row: ComplaintRecord) => (
        <div>
          <div className="font-medium">{getPartyName(row, "respondant")}</div>
          <div className="text-xs text-gray-500 capitalize">{row.respondantType}</div>
        </div>
      ),
    },
    {
      header: "Class & Year", accessor: "classId",
      render: (row: ComplaintRecord) => (
        <div className="text-xs">
          <div className="font-semibold">{row.complainClass?.className || `Class #${row.classId}`}</div>
          <div className="text-gray-500">{row.complainAcademicYear?.yearName || `Year #${row.academicYearId}`}</div>
        </div>
      ),
    },
    {
      header: "Category", accessor: "category",
      render: (row: ComplaintRecord) => <CategoryBadge category={row.category} />,
    },
    {
      header: "Status", accessor: "status",
      render: (row: ComplaintRecord) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date", accessor: "createdAt",
      render: (row: ComplaintRecord) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions", accessor: "actions",
      render: (row: ComplaintRecord) => (
        <div className="flex items-center gap-1.5">
          <button title="View Details" onClick={() => setSelectedForDetail(row)}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition">
            <FiEye size={16} />
          </button>
          <button title="Update Status" onClick={() => setSelectedForStatus(row)}
            className="p-1.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 transition">
            <FiCheckSquare size={16} />
          </button>
          <button
            title={row.status === "pending" ? "Edit Complaint" : "Only pending complaints can be edited"}
            disabled={row.status !== "pending"}
            onClick={() => { setEditingComplaint(row); setShowFormModal(true); }}
            className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent transition">
            <FiEdit size={16} />
          </button>
          <button title="Delete" onClick={() => setConfirmDelete(row.id)}
            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl shadow border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${cardBg}`}>
        <div>
          <h2 className={`text-xl font-bold ${textColor}`}>Complaint Management</h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Track, manage, and resolve student &amp; teacher complaints
          </p>
        </div>
        <button
          onClick={() => { setEditingComplaint(null); setShowFormModal(true); }}
          className={`${theme.primary} text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow hover:opacity-90 transition`}
        >
          + File Complaint
        </button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} isDark={isDark} />

      {/* Table + Filters */}
      <div className={`p-6 rounded-xl shadow border space-y-4 ${cardBg}`}>
        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <input type="text" placeholder="Search description..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`${filterInputCls} min-w-[180px]`} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterInputCls}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterInputCls}>
            <option value="">All Categories</option>
            <option value="student_to_student">Student → Student</option>
            <option value="student_to_teacher">Student → Teacher</option>
            <option value="teacher_to_student">Teacher → Student</option>
          </select>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={filterInputCls}>
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={filterInputCls}>
            <option value="">All Years</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.yearName}</option>)}
          </select>
          {(filterStatus || filterCategory || filterClass || filterYear || searchQuery) && (
            <button onClick={() => { setFilterStatus(""); setFilterCategory(""); setFilterClass(""); setFilterYear(""); setSearchQuery(""); }}
              className="text-xs text-blue-500 hover:underline ml-auto">Reset Filters</button>
          )}
        </div>
        <DataTable columns={columns} data={complaints} />
      </div>

      {/* Modals */}
      {showFormModal && (
        <ComplaintForm isDark={isDark} themeBtn={theme.primary}
          initialData={editingComplaint}
          onClose={() => { setShowFormModal(false); setEditingComplaint(null); }}
          onSaved={handleSaved} />
      )}
      {selectedForStatus && (
        <StatusUpdateModal complaint={selectedForStatus} isDark={isDark} themePrimary={theme.primary}
          onClose={() => setSelectedForStatus(null)}
          onUpdated={() => { fetchComplaints(); fetchStats(); }}
          toastSuccess={success} toastError={error} />
      )}
      {selectedForDetail && (
        <ComplaintDetailModal complaint={selectedForDetail} isDark={isDark}
          onClose={() => setSelectedForDetail(null)} />
      )}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-xl border w-full max-w-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Delete Complaint</h3>
            <p className={`text-xs mb-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Are you sure? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className={`px-4 py-2 text-xs rounded border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-xs rounded bg-red-600 hover:bg-red-700 text-white font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ─── Scoped View (Teacher or Student) ────────────────────────────────────────
// Teacher  → files teacher_to_student; sees only their own complaints
// Student  → files student_to_student or student_to_teacher; sees only theirs

interface ScopedViewProps {
  isDark: boolean;
  partyType: "teacher" | "student";
}

interface AssignmentOption {
  id: number;
  classId: number;
  academicYearId: number;
  Class?: { className: string };
  class?: { className: string };
  AcademicYear?: { yearName: string };
  academicYear?: { yearName: string };
}

interface StudentOption {
  studentId: number;
  fullName: string;
  phone?: string;
}

const ScopedView: React.FC<ScopedViewProps> = ({ isDark, partyType }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const isTeacher = partyType === "teacher";

  // ── Scoped options ──────────────────────────────────────────────────────
  // Teacher: their course assignments → unique classes
  // Student: their enrollments        → classes they are enrolled in
  const [scopedClasses, setScopedClasses] = useState<AssignmentOption[]>([]);
  const [currentYear, setCurrentYear] = useState<{ id: number; yearName: string } | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // ── For the respondant dropdown ─────────────────────────────────────────
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────
  const [selectedOption, setSelectedOption] = useState<AssignmentOption | null>(null);
  const [respondant, setRespondant] = useState("");
  // student-only: which flow (student_to_student or student_to_teacher)
  const [studentFlow, setStudentFlow] = useState<"student_to_student" | "student_to_teacher">("student_to_student");
  const [classTeachers, setClassTeachers] = useState<Array<{ id: number; fullName: string; userName?: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ── My complaints list ──────────────────────────────────────────────────
  const [myComplaints, setMyComplaints] = useState<ComplaintRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // ── Detail / edit / delete ──────────────────────────────────────────────
  const [detailTarget, setDetailTarget] = useState<ComplaintRecord | null>(null);
  const [editTarget, setEditTarget] = useState<ComplaintRecord | null>(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ComplaintRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── status modal ────────────────────────────────────────────────────────
  const [statusModal, setStatusModal] = useState({ open: false, type: "success" as "success" | "error", title: "", message: "" });
  const showStatus = (type: "success" | "error", title: string, message: string) =>
    setStatusModal({ open: true, type, title, message });

  // ── Load scoped classes + current year ─────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        setLoadingClasses(true);
        const [scopeRes, yearRes] = await Promise.all([
          isTeacher
            ? api.get(`/courseAssign/teacher/${user.id}`)
            : api.get("/enrollments"),
          api.get("/academicYear"),
        ]);

        if (isTeacher) {
          const raw: AssignmentOption[] = scopeRes.data?.data ?? scopeRes.data ?? [];
          // Deduplicate by classId+academicYearId
          const seen = new Set<string>();
          const unique = raw.filter((a) => {
            const k = `${a.classId}-${a.academicYearId}`;
            if (seen.has(k)) return false;
            seen.add(k); return true;
          });
          setScopedClasses(unique);
        } else {
          // Student: filter enrollments by this student's id
          const allEnrollments: any[] = scopeRes.data?.data ?? scopeRes.data ?? [];
          const mine = allEnrollments.filter((e) => String(e.studentId) === String(user.id));
          // Map to AssignmentOption shape
          const mapped: AssignmentOption[] = mine.map((e) => ({
            id: e.id,
            classId: e.classId ?? e.Class?.id,
            academicYearId: e.academicYearId ?? e.AcademicYear?.id,
            Class: e.Class,
            AcademicYear: e.AcademicYear,
          }));
          setScopedClasses(mapped);
        }

        const years: any[] = yearRes.data?.data ?? yearRes.data ?? [];
        const active = years.find((y) => y.isCurrent) ?? years[0] ?? null;
        setCurrentYear(active);
      } catch {
        showStatus("error", "Load Failed", "Could not load your classes.");
      } finally {
        setLoadingClasses(false);
      }
    };
    load();
  }, [user?.id, isTeacher]);

  // ── Fetch my complaints ─────────────────────────────────────────────────
  const fetchMyComplaints = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoadingList(true);
      const res = await api.get(`/complaints/track/complainant/${user.id}`, {
        params: { type: partyType },
      });
      setMyComplaints(res.data ?? []);
    } catch {
      setMyComplaints([]);
    } finally {
      setLoadingList(false);
    }
  }, [user?.id, partyType]);

  useEffect(() => { fetchMyComplaints(); }, [fetchMyComplaints]);

  // ── Handle class selection ──────────────────────────────────────────────
  const handleClassChange = async (optionId: string) => {
    const found = scopedClasses.find((o) => String(o.id) === optionId) ?? null;
    setSelectedOption(found);
    setRespondant("");
    setStudents([]);
    setClassTeachers([]);

    if (!found) return;

    // For teacher flow or student_to_student: load enrolled students
    if (isTeacher || studentFlow === "student_to_student") {
      try {
        setLoadingStudents(true);
        const res = await api.get(`/enrollments/class/${found.classId}`);
        const list: StudentOption[] = (res.data?.data ?? []).filter(
          (s: any) => String(s.studentId) !== String(user?.id)
        );
        setStudents(list);
      } catch {
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    }

    // For student_to_teacher: load teachers in that class
    if (!isTeacher && studentFlow === "student_to_teacher") {
      try {
        setLoadingTeachers(true);
        const res = await api.get(`/courseAssign/class/${found.classId}/teachers`);
        const data = res.data?.data ?? res.data ?? [];
        setClassTeachers(data);
      } catch {
        setClassTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    }
  };

  // Re-load respondants when student changes flow
  useEffect(() => {
    if (!selectedOption || isTeacher) return;
    setRespondant("");
    if (studentFlow === "student_to_student") {
      setLoadingStudents(true);
      api.get(`/enrollments/class/${selectedOption.classId}`)
        .then((res) => {
          const list = (res.data?.data ?? []).filter(
            (s: any) => String(s.studentId) !== String(user?.id)
          );
          setStudents(list);
        })
        .catch(() => setStudents([]))
        .finally(() => setLoadingStudents(false));
    } else {
      setLoadingTeachers(true);
      api.get(`/courseAssign/class/${selectedOption.classId}/teachers`)
        .then((res) => setClassTeachers(res.data?.data ?? res.data ?? []))
        .catch(() => setClassTeachers([]))
        .finally(() => setLoadingTeachers(false));
    }
  }, [studentFlow]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedOption) { setFormError("Please select a class."); return; }
    if (!respondant) { setFormError("Please select a respondant."); return; }
    if (!complaintText.trim()) { setFormError("Complaint description cannot be empty."); return; }
    if (!currentYear) { setFormError("No active academic year found. Contact an administrator."); return; }

    const respondantType = isTeacher
      ? "student"
      : studentFlow === "student_to_teacher" ? "teacher" : "student";

    try {
      setSubmitting(true);
      await api.post("/complaints", {
        complainant: user!.id,
        complainantType: partyType,
        respondant: Number(respondant),
        respondantType,
        classId: selectedOption.classId,
        academicYearId: selectedOption.academicYearId ?? currentYear.id,
        complaint: complaintText.trim(),
      });
      setSelectedOption(null);
      setRespondant("");
      setComplaintText("");
      setStudents([]);
      setClassTeachers([]);
      showStatus("success", "Complaint Filed", "Your complaint has been submitted.");
      fetchMyComplaints();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Failed to file complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit save ───────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    setEditError("");
    if (!editText.trim()) { setEditError("Description cannot be empty."); return; }
    try {
      setEditSubmitting(true);
      await api.put(`/complaints/${editTarget!.id}`, { complaint: editText.trim() });
      setEditTarget(null);
      showStatus("success", "Updated", "Complaint updated successfully.");
      fetchMyComplaints();
    } catch (err: any) {
      setEditError(err?.response?.data?.message ?? "Failed to update.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/complaints/${deleteTarget!.id}`);
      setDeleteTarget(null);
      showStatus("success", "Deleted", "Complaint deleted.");
      fetchMyComplaints();
    } catch (err: any) {
      showStatus("error", "Delete Failed", err?.response?.data?.message ?? "Failed to delete.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const respondantOptions = isTeacher
    ? students
    : studentFlow === "student_to_student"
    ? students
    : classTeachers;
  const loadingRespondants = isTeacher ? loadingStudents : (studentFlow === "student_to_student" ? loadingStudents : loadingTeachers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl shadow border ${cardBg}`}>
        <h2 className={`text-xl font-bold ${textColor}`}>My Complaints</h2>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {isTeacher
            ? "File a complaint against a student in one of your assigned classes."
            : "File a complaint against a student or teacher in one of your classes."}
        </p>
      </div>

      {/* File complaint form */}
      <div className={`p-6 rounded-xl shadow border ${cardBg}`}>
        <h3 className={`text-base font-semibold mb-4 ${textColor}`}>File a New Complaint</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded px-3 py-2">{formError}</div>
          )}

          {/* Complainant (locked) */}
          <div>
            <label className={labelCls(isDark)}>Complainant (You)</label>
            <input disabled value={user?.fullName ?? (isTeacher ? `Teacher #${user?.id}` : `Student #${user?.id}`)}
              className={`${inputCls(isDark)} opacity-75 cursor-not-allowed`} />
          </div>

          {/* Academic Year */}
          <div>
            <label className={labelCls(isDark)}>Academic Year</label>
            <div className={`px-3 py-2 rounded border text-sm font-medium ${isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-700"}`}>
              {currentYear ? `${currentYear.yearName} (Current)` : "Loading…"}
            </div>
          </div>

          {/* Student-only: flow selector */}
          {!isTeacher && (
            <div>
              <label className={labelCls(isDark)}>Complaint Type</label>
              <div className="flex gap-2">
                {(["student_to_student", "student_to_teacher"] as const).map((f) => (
                  <button key={f} type="button"
                    onClick={() => { setStudentFlow(f); setRespondant(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      studentFlow === f
                        ? "bg-blue-600 text-white border-blue-600"
                        : isDark ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}>
                    {f === "student_to_student" ? "Student → Student" : "Student → Teacher"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Class */}
          <div>
            <label className={labelCls(isDark)}>
              Select Class
              {loadingClasses && <span className="ml-2 text-blue-400 text-xs">Loading…</span>}
            </label>
            <select className={inputCls(isDark)}
              value={selectedOption ? String(selectedOption.id) : ""}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={loadingClasses}>
              <option value="">
                {loadingClasses ? "Loading your classes…" : scopedClasses.length === 0 ? "No classes found" : "Select a class…"}
              </option>
              {scopedClasses.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.Class?.className ?? o.class?.className ?? `Class #${o.classId}`}
                  {(o.AcademicYear?.yearName ?? o.academicYear?.yearName)
                    ? ` — ${o.AcademicYear?.yearName ?? o.academicYear?.yearName}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Respondant */}
          <div>
            <label className={labelCls(isDark)}>
              {isTeacher ? "Student (Respondant)" : studentFlow === "student_to_teacher" ? "Teacher (Respondant)" : "Student (Respondant)"}
              {loadingRespondants && <span className="ml-2 text-blue-400 text-xs">Loading…</span>}
            </label>
            <select className={inputCls(isDark)} value={respondant}
              onChange={(e) => setRespondant(e.target.value)}
              disabled={!selectedOption || loadingRespondants}>
              <option value="">
                {!selectedOption ? "Select a class first…"
                  : loadingRespondants ? "Loading…"
                  : respondantOptions.length === 0 ? "No options in this class"
                  : "Select…"}
              </option>
              {respondantOptions.map((p: any) => (
                <option key={p.id ?? p.studentId} value={p.id ?? p.studentId}>
                  {p.fullName}
                  {p.studentId ? ` (${p.studentId})` : ""}
                  {p.userName ? ` (@${p.userName})` : ""}
                  {p.phone ? ` — ${p.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls(isDark)}>Complaint Description</label>
            <textarea rows={4} maxLength={2000} placeholder="Describe the issue in detail…"
              className={inputCls(isDark)} value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)} />
            <p className={`text-xs text-right mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {complaintText.length} / 2000
            </p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={submitting}
              className={`px-5 py-2 rounded text-sm font-medium text-white disabled:opacity-50 ${theme.primary}`}>
              {submitting ? "Filing…" : "File Complaint"}
            </button>
          </div>
        </form>
      </div>

      {/* My complaints list */}
      <div className={`p-6 rounded-xl shadow border ${cardBg}`}>
        <h3 className={`text-base font-semibold mb-4 ${textColor}`}>Complaints I Have Filed</h3>
        {loadingList ? (
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading…</p>
        ) : myComplaints.length === 0 ? (
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>You have not filed any complaints yet.</p>
        ) : (
          <div className="space-y-3">
            {myComplaints.map((c) => (
              <div key={c.id} className={`p-4 rounded-lg border ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-0.5">
                    <p className={`text-sm font-medium ${textColor}`}>
                      Against: {getPartyName(c, "respondant")}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {c.complainClass?.className ?? `Class #${c.classId}`}
                      {" · "}
                      {c.complainAcademicYear?.yearName ?? `Year #${c.academicYearId}`}
                      {" · "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{c.complaint}</p>
                {c.resolutionNotes && (
                  <p className={`mt-1 text-xs italic border-t pt-1 ${isDark ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-200"}`}>
                    Resolution: {c.resolutionNotes}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setDetailTarget(c)}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                    View
                  </button>
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => { setEditTarget(c); setEditText(c.complaint); setEditError(""); }}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(c)}
                        className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailTarget && (
        <ComplaintDetailModal complaint={detailTarget} isDark={isDark} onClose={() => setDetailTarget(null)} />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-xl p-6 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <h3 className="text-base font-semibold mb-3">Edit Complaint #{editTarget.id}</h3>
            {editError && <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded px-3 py-2 mb-3">{editError}</div>}
            <textarea rows={5} maxLength={2000} className={inputCls(isDark)} value={editText}
              onChange={(e) => setEditText(e.target.value)} />
            <p className={`text-xs text-right mt-0.5 mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{editText.length} / 2000</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditTarget(null)}
                className={`px-4 py-2 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editSubmitting}
                className={`px-5 py-2 rounded text-sm font-medium text-white disabled:opacity-50 ${theme.primary}`}>
                {editSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-xl shadow-xl p-6 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <h3 className="text-base font-semibold mb-2">Delete Complaint?</h3>
            <p className={`text-sm mb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Complaint #{deleteTarget.id} will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className={`px-4 py-2 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 rounded text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status feedback */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-xl shadow-xl p-6 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <h3 className={`text-base font-semibold mb-2 ${statusModal.type === "error" ? "text-red-600" : "text-green-600"}`}>
              {statusModal.title}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{statusModal.message}</p>
            <div className="flex justify-end">
              <button onClick={() => setStatusModal((p) => ({ ...p, open: false }))}
                className={`px-4 py-2 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Root: pick view by role ──────────────────────────────────────────────────

const ComplaintsPage: React.FC = () => {
  const { currentTheme } = useContext(ThemeContext);
  const { hasRole } = useContext(AuthContext);
  const isDark = currentTheme === "dark";

  if (hasRole("teacher")) return <ScopedView isDark={isDark} partyType="teacher" />;
  if (hasRole("student")) return <ScopedView isDark={isDark} partyType="student" />;
  return <AdminView isDark={isDark} />;
};

export default ComplaintsPage;
