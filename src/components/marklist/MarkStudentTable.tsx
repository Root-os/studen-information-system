import React, { useContext } from "react";
import { FiTrash2 } from "react-icons/fi";
import ThemeContext from "../layout/ThemeContext";
import type { EnrolledStudent, MarkMap, MarkDetailItem } from "./marklistTypes";
import { getGrade, getGradeColor } from "./marklistTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Two usage modes:
 *
 *  1. Edit mode (MarkListPage): pass `students` + `marks` + `onMarkChange`.
 *     Each row has a number input for the mark (0–100).
 *
 *  2. Read-only mode (ViewMarkList detail modal): pass `records` only.
 *     Rows display the saved mark, grade, and pass/fail badge.
 *
 *  3. Edit-saved mode (ViewMarkList edit modal): pass `records` + `editMarks`
 *     + `onEditMarkChange` to allow in-place editing of an existing mark list.
 */
interface MarkStudentTableProps {
  // ── Edit / Create mode ────────────────────────────────────────────────────
  students?: EnrolledStudent[];
  marks?: MarkMap;
  onMarkChange?: (enrollmentId: number, value: number | "") => void;

  // ── Read-only mode ────────────────────────────────────────────────────────
  records?: MarkDetailItem[];

  // ── Edit-saved mode (in ViewMarkList) ─────────────────────────────────────
  editMarks?: Record<number, number | "">; // key = MarkDetail.id
  onEditMarkChange?: (detailId: number, value: number | "") => void;
  /** Called when the trash icon is clicked; parent handles the API call */
  onDeleteRecord?: (detailId: number) => void;
  /** Set of detailIds currently being deleted (shows spinner) */
  deletingMarkId?: number | null;

  // ── Shared ────────────────────────────────────────────────────────────────
  loading?: boolean;
  emptyMessage?: string;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ─── Grade badge ──────────────────────────────────────────────────────────────

const GradeBadge: React.FC<{ mark: number }> = ({ mark }) => {
  const grade = getGrade(mark);
  const color = getGradeColor(mark);
  return (
    <span className={`font-semibold ${color}`}>
      {grade}
    </span>
  );
};

const PassFailBadge: React.FC<{ mark: number }> = ({ mark }) => {
  const passed = mark >= 50;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {passed ? "Pass" : "Fail"}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const MarkStudentTable: React.FC<MarkStudentTableProps> = ({
  students,
  marks,
  onMarkChange,
  records,
  editMarks,
  onEditMarkChange,
  onDeleteRecord,
  deletingMarkId,
  loading = false,
  emptyMessage = "No students found.",
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const isEditSaved = !!editMarks && !!onEditMarkChange;
  const isReadOnly = !!records && !isEditSaved;
  const isCreate = !!students && !!marks;

  const rowCount = records?.length ?? students?.length ?? 0;

  // ── Shared class helpers ──────────────────────────────────────────────────
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

  const inputCls = [
    "border rounded px-2 py-1 text-sm w-28",
    "focus:outline-none focus:ring-1",
    isDark
      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400",
  ].join(" ");

  const textCls = isDark ? "text-gray-100 font-medium" : "text-gray-800 font-medium";
  const mutedCls = isDark ? "text-gray-400" : "text-gray-500";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`rounded shadow overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}>
      {/* Table header — 6 cols in edit-saved mode, 5 cols otherwise */}
      <div className={`grid ${isEditSaved ? "grid-cols-6" : "grid-cols-5"} ${headerCls}`}>
        <span>#</span>
        <span>Student</span>
        <span>Phone</span>
        <span>Mark (0–100)</span>
        <span>Grade / Status</span>
        {isEditSaved && <span>Action</span>}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-400">
          <Spinner />
          Loading students…
        </div>
      ) : rowCount === 0 ? (
        <p className={`p-8 text-sm text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {emptyMessage}
        </p>
      ) : isReadOnly && records ? (
        /* ── Read-only rows (ViewMarkList detail) ── */
        records.map((rec, idx) => (
          <div key={rec.id} className={`grid grid-cols-5 ${rowCls(idx)}`}>
            <span className={mutedCls}>{idx + 1}</span>
            <span className={textCls}>{rec.student.fullName}</span>
            <span className={mutedCls}>{rec.student.phone || "—"}</span>
            <span className={`font-bold ${getGradeColor(rec.mark)}`}>{rec.mark}</span>
            <div className="flex items-center gap-2">
              <GradeBadge mark={rec.mark} />
              <PassFailBadge mark={rec.mark} />
            </div>
          </div>
        ))
      ) : isEditSaved && records ? (
        /* ── Editable saved marks (ViewMarkList → Edit mode) ── */
        records.map((rec, idx) => {
          const currentVal = editMarks?.[rec.id] ?? rec.mark;
          const numVal = currentVal !== "" ? Number(currentVal) : null;
          const isDeleting = deletingMarkId === rec.id;
          return (
            <div key={rec.id} className={`grid grid-cols-6 ${rowCls(idx)}`}>
              <span className={mutedCls}>{idx + 1}</span>
              <span className={textCls}>{rec.student.fullName}</span>
              <span className={mutedCls}>{rec.student.phone || "—"}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={currentVal}
                onChange={(e) => {
                  const raw = e.target.value;
                  onEditMarkChange!(rec.id, raw === "" ? "" : Number(raw));
                }}
                className={inputCls}
                placeholder="0–100"
                disabled={isDeleting}
              />
              <div className="flex items-center gap-2">
                {numVal !== null && !isNaN(numVal) ? (
                  <>
                    <GradeBadge mark={numVal} />
                    <PassFailBadge mark={numVal} />
                  </>
                ) : (
                  <span className={mutedCls}>—</span>
                )}
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => onDeleteRecord?.(rec.id)}
                  disabled={isDeleting}
                  title="Delete this student's mark"
                  className={`p-1.5 rounded transition-colors ${
                    isDeleting
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-500 hover:bg-red-100"
                  }`}
                >
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <FiTrash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          );
        })
      ) : isCreate && students ? (
        /* ── Create mode (MarkListPage) ── */
        students.map((student, idx) => {
          const val = marks?.[student.enrollmentId] ?? "";
          const numVal = val !== "" ? Number(val) : null;
          return (
            <div key={student.enrollmentId} className={`grid grid-cols-5 ${rowCls(idx)}`}>
              <span className={mutedCls}>{idx + 1}</span>
              <span className={textCls}>{student.fullName}</span>
              <span className={mutedCls}>{student.phone || "—"}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={val}
                onChange={(e) => {
                  const raw = e.target.value;
                  onMarkChange!(student.enrollmentId, raw === "" ? "" : Number(raw));
                }}
                className={inputCls}
                placeholder="0–100"
              />
              <div className="flex items-center gap-2">
                {numVal !== null && !isNaN(numVal) ? (
                  <>
                    <GradeBadge mark={numVal} />
                    <PassFailBadge mark={numVal} />
                  </>
                ) : (
                  <span className={`text-xs italic ${mutedCls}`}>—</span>
                )}
              </div>
            </div>
          );
        })
      ) : null}
    </div>
  );
};

export default MarkStudentTable;
