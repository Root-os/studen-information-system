import React, { useContext } from "react";
import ThemeContext from "../layout/ThemeContext";
import {
  STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "./attendanceTypes";
import type {
  EnrolledStudent,
  AttendanceMap,
  AttendanceStatus,
  AttendanceStudentRecord,
} from "./attendanceTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Two usage modes:
 *
 *  1. Edit mode (AttendancePage): pass `students` + `attendance` + callbacks.
 *     Rows have editable status dropdowns and remark inputs.
 *
 *  2. Read-only mode (ViewAttendance detail modal): pass `records` only.
 *     Rows display saved status/remark with no inputs.
 */
interface AttendanceStudentTableProps {
  // ── Edit mode ──────────────────────────────────────────────────────────────
  /** Enrolled students list (edit mode) */
  students?: EnrolledStudent[];
  /** Current attendance state map (edit mode) */
  attendance?: AttendanceMap;
  /** Called when a student's status is changed */
  onStatusChange?: (enrollmentId: number, status: AttendanceStatus) => void;
  /** Called when a student's remark is changed */
  onRemarkChange?: (enrollmentId: number, remark: string) => void;

  // ── Read-only mode ─────────────────────────────────────────────────────────
  /** Saved student records from a fetched attendance record (view mode) */
  records?: AttendanceStudentRecord[];

  // ── Shared ─────────────────────────────────────────────────────────────────
  /** True while student data is loading */
  loading?: boolean;
  /** Message to show when no class is selected yet */
  emptyMessage?: string;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 text-gray-400"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AttendanceStudentTable: React.FC<AttendanceStudentTableProps> = ({
  students,
  attendance,
  onStatusChange,
  onRemarkChange,
  records,
  loading = false,
  emptyMessage = "No students found.",
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const isReadOnly = !!records;
  const rowCount = isReadOnly ? (records?.length ?? 0) : (students?.length ?? 0);

  // ── Shared class helpers ────────────────────────────────────────────────────
  const headerCls = [
    "text-xs font-semibold uppercase tracking-wide px-4 py-3 border-b",
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-300"
      : "bg-gray-50 border-gray-200 text-gray-500",
  ].join(" ");

  const rowCls = (idx: number) =>
    [
      "grid items-center px-4 py-3 border-b text-sm",
      isDark
        ? `border-gray-700 ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900/40"}`
        : `border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`,
    ].join(" ");

  const selectCls = (status: AttendanceStatus) =>
    [
      "border rounded px-2 py-1 text-sm w-40",
      "focus:outline-none focus:ring-1",
      isDark
        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
        : "bg-white border-gray-300 focus:ring-blue-400",
      STATUS_COLORS[status],
    ].join(" ");

  const remarkInputCls = [
    "border rounded px-2 py-1 text-sm w-full",
    "focus:outline-none focus:ring-1",
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-700 focus:ring-blue-400",
  ].join(" ");

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded shadow overflow-hidden ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Table header */}
      <div className={`grid grid-cols-4 ${headerCls}`}>
        <span>Student</span>
        <span>Phone</span>
        <span>Status</span>
        <span>Remark</span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-400">
          <Spinner />
          Loading students…
        </div>
      ) : rowCount === 0 ? (
        /* Empty state */
        <p
          className={`p-8 text-sm text-center ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {emptyMessage}
        </p>
      ) : isReadOnly ? (
        /* ── Read-only rows (ViewAttendance) ── */
        records!.map((record, idx) => (
          <div key={record.attendanceDetailId} className={`grid grid-cols-4 ${rowCls(idx)}`}>
            <span
              className={`font-medium ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {record.fullName}
            </span>

            {/* No phone in saved records — show row number instead */}
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>
              #{idx + 1}
            </span>

            <span className={`font-semibold ${STATUS_COLORS[record.status]}`}>
              {STATUS_LABELS[record.status]}
            </span>

            <span className={isDark ? "text-gray-400" : "text-gray-500"}>
              {record.remark || "—"}
            </span>
          </div>
        ))
      ) : (
        /* ── Editable rows (AttendancePage) ── */
        students!.map((student, idx) => {
          const entry = attendance?.[student.enrollmentId];
          const status: AttendanceStatus = entry?.status ?? "PRESENT";
          const isPresent = status === "PRESENT";

          return (
            <div
              key={student.enrollmentId}
              className={`grid grid-cols-4 ${rowCls(idx)}`}
            >
              <span
                className={`font-medium ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {student.fullName}
              </span>

              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                {student.phone || "—"}
              </span>

              <select
                value={status}
                onChange={(e) =>
                  onStatusChange?.(
                    student.enrollmentId,
                    e.target.value as AttendanceStatus
                  )
                }
                className={selectCls(status)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <div>
                {!isPresent ? (
                  <input
                    type="text"
                    value={entry?.remark ?? ""}
                    onChange={(e) =>
                      onRemarkChange?.(student.enrollmentId, e.target.value)
                    }
                    placeholder="Reason (optional)"
                    className={remarkInputCls}
                  />
                ) : (
                  <span
                    className={`text-xs italic ${
                      isDark ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AttendanceStudentTable;
