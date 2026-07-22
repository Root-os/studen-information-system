import React, { useContext } from "react";
import ThemeContext from "../layout/ThemeContext";
import type { CourseAssignment } from "./attendanceTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AttendanceSessionFormProps {
  /** Full list of course assignments to populate the dropdown */
  courseAssignments: CourseAssignment[];
  /** Currently selected assignment (null = nothing chosen yet) */
  selectedAssignment: CourseAssignment | null;
  /** Currently selected date string (YYYY-MM-DD) */
  date: string;
  /** True while assignments are being fetched */
  loadingAssignments?: boolean;
  /** Called when the user picks a different class/course */
  onAssignmentChange: (assignment: CourseAssignment | null) => void;
  /** Called when the user changes the date */
  onDateChange: (date: string) => void;
  /** Called when "Mark All Present" is clicked */
  onMarkAllPresent: () => void;
  /** Disable "Mark All Present" when no students are loaded */
  hasStudents?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AttendanceSessionForm: React.FC<AttendanceSessionFormProps> = ({
  courseAssignments,
  selectedAssignment,
  date,
  loadingAssignments = false,
  onAssignmentChange,
  onDateChange,
  onMarkAllPresent,
  hasStudents = false,
}) => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // ── Shared input class ──────────────────────────────────────────────────────
  const inputCls = [
    "border rounded px-3 py-2 w-full text-sm",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400",
  ].join(" ");

  const readOnlyCls = [
    inputCls,
    "cursor-default",
    isDark ? "opacity-60" : "bg-gray-50 text-gray-500",
  ].join(" ");

  const labelCls = `text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`;

  // ── Handle dropdown change ──────────────────────────────────────────────────
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      onAssignmentChange(null);
      return;
    }
    const found = courseAssignments.find((item) => item.id === id) ?? null;
    onAssignmentChange(found);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`p-6 rounded shadow space-y-5 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Section label */}
      <h3
        className={`text-xs font-semibold uppercase tracking-wide ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Session Details
      </h3>

      {/* 4-column selector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Class / Course dropdown */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>
            Class / Course <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedAssignment?.id ?? ""}
            onChange={handleSelectChange}
            disabled={loadingAssignments}
            className={inputCls}
          >
            <option value="">
              {loadingAssignments ? "Loading…" : "Select Class / Course"}
            </option>
            {courseAssignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.class?.className} — {item.course?.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Read-only auto-filled fields */}
        {[
          { label: "Course", value: selectedAssignment?.course?.courseName ?? "" },
          { label: "Teacher", value: selectedAssignment?.teacher?.fullName ?? "" },
          { label: "Academic Year", value: selectedAssignment?.academicYear?.yearName ?? "" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className={labelCls}>{label}</label>
            <input
              value={value}
              readOnly
              placeholder={label}
              className={readOnlyCls}
            />
          </div>
        ))}
      </div>

      {/* Date + Mark All row */}
      <div className="flex flex-wrap gap-4 items-end pt-1">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Attendance Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={`${inputCls} w-44`}
          />
        </div>

        <button
          type="button"
          onClick={onMarkAllPresent}
          disabled={!hasStudents}
          className={
            !hasStudents
              ? "px-4 py-2 rounded text-sm font-medium bg-gray-700 text-white cursor-not-allowed"
              : `px-4 py-2 rounded text-sm font-medium ${theme.primary} text-white`
          }
        >
          ✓ Mark All Present
        </button>
      </div>
    </div>
  );
};

export default AttendanceSessionForm;

