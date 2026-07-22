import React, { useContext, useMemo } from "react";
import ThemeContext from "../layout/ThemeContext";
import type { MarkMap, MarkListStats } from "./marklistTypes";
import { computeMarkStats } from "./marklistTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Two usage modes:
 *
 *  1. Live mode (MarkListPage — entering marks):
 *     Pass `marks` (a MarkMap). Stats are computed on the fly.
 *
 *  2. Record mode (ViewMarkList — viewing a saved record):
 *     Pass `statistics` (pre-computed from the fetched record).
 */
interface MarkStatsBarProps {
  /** Live mark map (entering-marks mode) */
  marks?: MarkMap;
  /** Pre-computed statistics (view-record mode) */
  statistics?: MarkListStats;
}

// ─── Stat badge definition ────────────────────────────────────────────────────

interface StatBadge {
  label: string;
  value: string | number;
  colorClass: string;
  bgClass: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MarkStatsBar: React.FC<MarkStatsBarProps> = ({ marks, statistics }) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const stats: MarkListStats = useMemo(() => {
    if (statistics) return statistics;
    if (marks) return computeMarkStats(marks);
    return { total: 0, highest: 0, lowest: 0, average: 0, passed: 0, failed: 0 };
  }, [marks, statistics]);

  const badges: StatBadge[] = [
    {
      label: "Total",
      value: stats.total,
      colorClass: isDark ? "text-gray-100" : "text-gray-800",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
    },
    {
      label: "Highest",
      value: stats.highest,
      colorClass: "text-green-600",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-green-50 border-green-200",
    },
    {
      label: "Lowest",
      value: stats.lowest,
      colorClass: "text-red-600",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-red-50 border-red-200",
    },
    {
      label: "Average",
      value: stats.average.toFixed(1),
      colorClass: "text-blue-600",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-blue-50 border-blue-200",
    },
    {
      label: "Passed",
      value: stats.passed,
      colorClass: "text-emerald-600",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Failed",
      value: stats.failed,
      colorClass: "text-orange-600",
      bgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-orange-50 border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {badges.map(({ label, value, colorClass, bgClass }) => (
        <div
          key={label}
          className={`rounded-lg border px-3 py-3 text-center ${bgClass}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default MarkStatsBar;
