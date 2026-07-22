import React, { useEffect, useState, useContext } from "react";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import StatusModal from "../../components/ui/successModal";
import usePagePermission from "../../hooks/userPagePermission";
import { AuthContext } from "../../contexts/AuthContext";

import MarkSessionForm from "../../components/marklist/MarkSessionForm";
import MarkStatsBar from "../../components/marklist/MarkStatsBar";
import MarkStudentTable from "../../components/marklist/MarkStudentTable";
import type {
  CourseAssignment,
  EnrolledStudent,
  MarkMap,
} from "../../components/marklist/marklistTypes";
import { buildInitialMarkMap } from "../../components/marklist/marklistTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusModalState {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MarkListPage: React.FC = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const { canCreate } = usePagePermission("marklist");
  const { user, hasRole } = useContext(AuthContext);

  // ── State ──────────────────────────────────────────────────────────────────
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [marks, setMarks] = useState<MarkMap>({});

  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [statusModal, setStatusModal] = useState<StatusModalState>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (
    type: StatusModalState["type"],
    title: string,
    message: string
  ) => setStatusModal({ open: true, type, title, message });

  // ── Fetch course assignments on mount ──────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingAssignments(true);
        // Teachers only see their own assigned courses/classes
        const url = hasRole("teacher")
          ? `/courseAssign/teacher/${user.id}`
          : "/courseAssign";
        const res = await api.get(url);
        setCourseAssignments(res.data.data || []);
      } catch {
        showStatus("error", "Load Failed", "Failed to load course assignments");
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetch();
  }, []);

  // ── Handle class/course selection ─────────────────────────────────────────
  const handleAssignmentChange = async (assignment: CourseAssignment | null) => {
    setSelectedAssignment(assignment);
    setStudents([]);
    setMarks({});

    if (!assignment) return;

    try {
      setLoadingStudents(true);
      const res = await api.get(`/enrollments/class/${assignment.classId}`);
      const studentList: EnrolledStudent[] = res.data.data || [];
      setStudents(studentList);
      setMarks(buildInitialMarkMap(studentList));
    } catch {
      showStatus("error", "Load Failed", "Failed to load students for this class");
    } finally {
      setLoadingStudents(false);
    }
  };

  // ── Mark entry helpers ─────────────────────────────────────────────────────
  const handleMarkChange = (enrollmentId: number, value: number | "") => {
    setMarks((prev) => ({ ...prev, [enrollmentId]: value }));
  };

  const handleClearAll = () => {
    setMarks(buildInitialMarkMap(students));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedAssignment) {
      showStatus("error", "Selection Required", "Please select a class and course first");
      return;
    }
    if (students.length === 0) {
      showStatus("error", "No Students", "There are no students enrolled in this class");
      return;
    }

    // Validate — all marks must be filled and in range
    const unmarked = students.filter(
      (s) => marks[s.enrollmentId] === "" || marks[s.enrollmentId] === undefined
    );
    if (unmarked.length > 0) {
      showStatus(
        "error",
        "Incomplete Marks",
        `Please enter marks for all ${students.length} students. ${unmarked.length} still empty.`
      );
      return;
    }

    const outOfRange = students.filter((s) => {
      const v = Number(marks[s.enrollmentId]);
      return v < 0 || v > 100;
    });
    if (outOfRange.length > 0) {
      showStatus("error", "Invalid Marks", "All marks must be between 0 and 100");
      return;
    }

    const payload = {
      courseAssignmentId: selectedAssignment.id,
      marks: students.map((s) => ({
        enrollmentId: s.enrollmentId,
        mark: Number(marks[s.enrollmentId]),
      })),
    };

    try {
      setSubmitting(true);
      await api.post("/marks", payload);
      showStatus("success", "Marks Saved", "Mark list recorded successfully");
      // Reset for next entry
      setSelectedAssignment(null);
      setStudents([]);
      setMarks({});
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save marks";
      if (err?.response?.status === 409) {
        showStatus(
          "error",
          "Already Recorded",
          `${msg}\n\nUse View Mark Lists to review or update the existing record.`
        );
      } else {
        showStatus("error", "Save Failed", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className={`p-6 rounded shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${theme.text}`}>Take Marks</h2>
        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Select a class and course, then enter each student's mark (0–100).
        </p>
      </div>

      {/* ── Session Form ── */}
      <MarkSessionForm
        courseAssignments={courseAssignments}
        selectedAssignment={selectedAssignment}
        loadingAssignments={loadingAssignments}
        onAssignmentChange={handleAssignmentChange}
        onClearAll={handleClearAll}
        hasStudents={students.length > 0}
      />

      {/* ── Live Stats Bar (only visible once students are loaded) ── */}
      {students.length > 0 && <MarkStatsBar marks={marks} />}

      {/* ── Student Table ── */}
      <MarkStudentTable
        students={students}
        marks={marks}
        onMarkChange={handleMarkChange}
        loading={loadingStudents}
        emptyMessage={
          selectedAssignment
            ? "No students are enrolled in this class."
            : "Select a class and course above to load students."
        }
      />

      {/* ── Save Button ── */}
      {canCreate && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || students.length === 0}
            className={
              submitting || students.length === 0
                ? "px-6 py-2 rounded font-medium text-white bg-gray-800 cursor-not-allowed"
                : `px-6 py-2 rounded font-medium text-white ${theme.primary}`
            }
          >
            {submitting ? "Saving…" : "Save Mark List"}
          </button>
        </div>
      )}

      {/* ── Status Modal ── */}
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

export default MarkListPage;
