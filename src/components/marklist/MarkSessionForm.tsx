import React, { useContext } from "react";
import ThemeContext from "../layout/ThemeContext";
import type { CourseAssignment } from "./marklistTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MarkSessionFormProps {
  /** Full list of course assignments to populate the dropdown */
  courseAssignments: CourseAssignment[];
  /** Currently selected assignment (null = nothing chosen yet) */
  selectedAssignment: CourseAssignment | null;
  /** True while assignments are being fetched */
  loadingAssignments?: boolean;
  /** Called when the user picks a different class/course */
  onAssignmentChange: (assignment: CourseAssignment | null) => void;
  /** Called when "Clear All Marks" is clicked */
  onClearAll: () => void;
  /** Disable "Clear All" when no students are loaded */
  hasStudents?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MarkSessionForm: React.FC<MarkSessionFormProps> = ({
  courseAssignments,
  selectedAssignment,
  loadingAssignments = false,
  onAssignmentChange,
  onClearAll,
  hasStudents = false,
}) => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      onAssignmentChange(null);
      return;
    }
    const found = courseAssignments.find((item) => item.id === id) ?? null;
    onAssignmentChange(found);
  };

  return (
    <div className={`p-6 rounded shadow space-y-5 ${isDark ? "bg-gray-800" : "bg-white"}`}>
      {/* Section label */}
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Mark List Details
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

      {/* Clear All Marks button */}
      <div className="flex items-end pt-1">
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasStudents}
          className={
            !hasStudents
              ? "px-4 py-2 rounded text-sm font-medium bg-gray-700 text-white cursor-not-allowed"
              : `px-4 py-2 rounded text-sm font-medium border ${
                  isDark
                    ? "border-gray-500 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`
          }
        >
          ✕ Clear All Marks
        </button>
      </div>
    </div>
  );
};

export default MarkSessionForm;
