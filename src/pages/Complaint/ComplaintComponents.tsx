import React, { useState } from "react";
import { STATUS_META, CATEGORY_LABELS, getPartyName } from "./complainTypes";
import type { Status, Category, ComplaintRecord, ComplaintStats } from "./complainTypes";
import api from "../../hooks/api";

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

// ─── Category Badge ───────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  category: Category;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const colorMap: Record<Category, string> = {
    teacher_to_student: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
    student_to_teacher: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
    student_to_student: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[category] || "bg-gray-100 text-gray-800"}`}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

interface StatsBarProps {
  stats: ComplaintStats;
  isDark: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, isDark }) => {
  const cards = [
    { label: "Total",       value: stats.total || 0,       color: isDark ? "text-gray-200" : "text-gray-800", bg: isDark ? "bg-gray-800" : "bg-white" },
    { label: "Pending",     value: stats.pending || 0,     color: isDark ? "text-yellow-400" : "text-yellow-700", bg: isDark ? "bg-gray-800" : "bg-white" },
    { label: "In Progress", value: stats.in_progress || 0, color: isDark ? "text-blue-400" : "text-blue-700", bg: isDark ? "bg-gray-800" : "bg-white" },
    { label: "Resolved",    value: stats.resolved || 0,    color: isDark ? "text-green-400" : "text-green-700", bg: isDark ? "bg-gray-800" : "bg-white" },
    { label: "Rejected",    value: stats.rejected || 0,    color: isDark ? "text-red-400" : "text-red-700", bg: isDark ? "bg-gray-800" : "bg-white" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`${c.bg} rounded-lg p-4 flex flex-col items-center shadow border ${isDark ? "border-gray-700" : "border-gray-100"}`}
        >
          <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
          <span className={`text-xs mt-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Status Update Modal ──────────────────────────────────────────────────────

interface StatusUpdateModalProps {
  complaint: ComplaintRecord;
  isDark: boolean;
  themePrimary: string;
  onClose: () => void;
  onUpdated: () => void;
  toastSuccess: (msg: string) => void;
  toastError: (msg: string) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  complaint,
  isDark,
  themePrimary,
  onClose,
  onUpdated,
  toastSuccess,
  toastError,
}) => {
  const [status, setStatus] = useState<Status>(complaint.status);
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolutionNotes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/complaints/${complaint.id}/status`, {
        status,
        resolutionNotes: resolutionNotes.trim() || null,
      });
      toastSuccess("Complaint status updated successfully");
      onUpdated();
      onClose();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const modalBg = isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const inputBg = isDark
    ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-xl shadow-xl border overflow-hidden ${modalBg}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <h3 className={`text-base font-semibold ${textColor}`}>Update Complaint Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 ${inputBg}`}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Resolution / Status Notes
            </label>
            <textarea
              rows={4}
              placeholder="Enter resolution details or remarks..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 ${inputBg}`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded text-sm text-white font-medium disabled:opacity-50 ${themePrimary}`}
            >
              {submitting ? "Saving..." : "Save Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Complaint Detail Modal ───────────────────────────────────────────────────

interface ComplaintDetailModalProps {
  complaint: ComplaintRecord;
  isDark: boolean;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isDark,
  onClose,
}) => {
  const modalBg = isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <h3 className={`text-base font-semibold ${textColor}`}>Complaint Details (ID #{complaint.id})</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryBadge category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <span className={`block text-xs font-semibold ${labelColor}`}>Complainant ({complaint.complainantType})</span>
              <span className={`font-medium ${textColor}`}>{getPartyName(complaint, "complainant")}</span>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <span className={`block text-xs font-semibold ${labelColor}`}>Respondant ({complaint.respondantType})</span>
              <span className={`font-medium ${textColor}`}>{getPartyName(complaint, "respondant")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <span className={`block text-xs font-semibold ${labelColor}`}>Class</span>
              <span className={`font-medium ${textColor}`}>{complaint.complainClass?.className || `ID #${complaint.classId}`}</span>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <span className={`block text-xs font-semibold ${labelColor}`}>Academic Year</span>
              <span className={`font-medium ${textColor}`}>{complaint.complainAcademicYear?.yearName || `ID #${complaint.academicYearId}`}</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${cardBg}`}>
            <span className={`block text-xs font-semibold mb-1 ${labelColor}`}>Complaint Description</span>
            <p className={`whitespace-pre-wrap ${textColor}`}>{complaint.complaint}</p>
          </div>

          {complaint.resolutionNotes && (
            <div className={`p-4 rounded-lg border ${cardBg}`}>
              <span className={`block text-xs font-semibold mb-1 ${labelColor}`}>Resolution Notes</span>
              <p className={`whitespace-pre-wrap ${textColor}`}>{complaint.resolutionNotes}</p>
            </div>
          )}

          <div className={`text-xs ${labelColor} pt-2 border-t flex justify-between ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <span>Filed: {new Date(complaint.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        <div className={`px-6 py-3 border-t flex justify-end ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded text-sm border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
