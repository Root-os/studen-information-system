import React, { useContext, useMemo } from "react";
import ThemeContext from "../layout/ThemeContext";
import {
  STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BG_COLORS,
  computeStats,
} from "./attendanceTypes";
import type { AttendanceMap, AttendanceStatistics } from "./attendanceTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Two usage modes:
 *
 *  1. Live mode (AttendancePage — taking attendance):
 *     Pass `attendance` (an AttendanceMap). Stats are computed on the fly.
 *
 *  2. Record mode (ViewAttendance — viewing a saved record):
 *     Pass `statistics` (the object returned by the API).
 *     In this mode `attendance` is ignored.
 */
interface AttendanceStatsBarProps {
  /** Live attendance map (taking-attendance mode) */
  attendance?: AttendanceMap;
  /** Pre-computed statistics (view-record mode) */
  statistics?: AttendanceStatistics;
  /** Show a "Total" badge in addition to per-status badges */
  showTotal?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AttendanceStatsBar: React.FC<AttendanceStatsBarProps> = ({
  attendance,
  statistics,
  showTotal = true,
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // Derive per-status counts from whichever source was provided
  const counts = useMemo(() => {
    if (statistics) {
      // Map API shape → our AttendanceStatus keys
      return {
        PRESENT: statistics.present,
        ABSENT: statistics.absent,
        LATE: statistics.late,
        EXCUSED: statistics.excused,
        BY_PERMISSION: statistics.byPermission,
      };
    }
    if (attendance) {
      return computeStats(attendance);
    }
    return { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, BY_PERMISSION: 0 };
  }, [attendance, statistics]);

  const total = statistics?.totalStudents ?? Object.keys(attendance ?? {}).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total badge */}
      {showTotal && (
        <div
          className={`rounded-lg border px-3 py-3 text-center ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {total}
          </p>
        </div>
      )}

      {/* Per-status badges */}
      {STATUS_OPTIONS.map((status) => (
        <div
          key={status}
          className={`rounded-lg border px-3 py-3 text-center ${
            isDark ? "bg-gray-800 border-gray-700" : STATUS_BG_COLORS[status]
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status]}
          </p>
          <p className={`text-2xl font-bold mt-1 ${STATUS_COLORS[status]}`}>
            {counts[status]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStatsBar;
