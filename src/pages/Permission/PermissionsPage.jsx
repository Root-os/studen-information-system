import React, { useEffect, useState, useContext, useCallback } from "react";
import DataTable from "../../components/ui/simpletable";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import { AuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/toast";
import {
  FiShield,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiUser,
  FiFilter,
  FiFileText,
} from "react-icons/fi";

const PERMISSION_TYPES = [
  { value: "LEAVE", label: "Leave", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700" },
  { value: "VISIT", label: "Visit", color: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700" },
  { value: "MEDICAL", label: "Medical", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700" },
  { value: "OTHER", label: "Other", color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700" },
];

const STATUS_BADGES = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
};

const PermissionsPage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const { user } = useContext(AuthContext);
  const { success, error } = useToast();

  // State
  const [permissions, setPermissions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [viewingPermission, setViewingPermission] = useState(null);
  const [rejectingPermission, setRejectingPermission] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    type: "LEAVE",
    reason: "",
    fromDate: new Date().toISOString().split("T")[0],
    toDate: "",
    notes: "",
  });
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch all permissions with filters
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      if (filterUserId) params.userId = filterUserId;
      if (filterFromDate) params.from = filterFromDate;
      if (filterToDate) params.to = filterToDate;

      const res = await api.get("/permissions", { params });
      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      error("Failed to fetch permission requests");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, filterUserId, filterFromDate, filterToDate, error]);

  // Fetch users for dropdown
  useEffect(() => {
    api.get("/users")
      .then((r) => setUsersList(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Calculate summary stats
  const stats = {
    total: permissions.length,
    pending: permissions.filter((p) => p.status === "PENDING").length,
    approved: permissions.filter((p) => p.status === "APPROVED").length,
    rejected: permissions.filter((p) => p.status === "REJECTED").length,
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPermission(null);
    setFormData({
      userId: user?.id ? String(user.id) : "",
      type: "LEAVE",
      reason: "",
      fromDate: new Date().toISOString().split("T")[0],
      toDate: "",
      notes: "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  // Open Edit Modal (pending only)
  const handleOpenEdit = (item) => {
    if (item.status !== "PENDING") {
      error("Only pending permissions can be edited");
      return;
    }
    setEditingPermission(item);
    setFormData({
      userId: String(item.userId),
      type: item.type,
      reason: item.reason || "",
      fromDate: item.fromDate ? item.fromDate.split("T")[0] : new Date().toISOString().split("T")[0],
      toDate: item.toDate ? item.toDate.split("T")[0] : "",
      notes: item.notes || "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.userId || !formData.type || !formData.reason.trim() || !formData.fromDate) {
      setFormError("Requester, Type, Reason, and From Date are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission.id}`, {
          type: formData.type,
          reason: formData.reason.trim(),
          fromDate: formData.fromDate,
          toDate: formData.toDate || null,
          notes: formData.notes.trim() || null,
        });
        success("Permission request updated successfully");
      } else {
        await api.post("/permissions", {
          userId: Number(formData.userId),
          type: formData.type,
          reason: formData.reason.trim(),
          fromDate: formData.fromDate,
          toDate: formData.toDate || null,
          notes: formData.notes.trim() || null,
        });
        success("Permission request submitted successfully");
      }

      setShowFormModal(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save permission request");
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Permission
  const handleApprove = async (id) => {
    try {
      await api.patch(`/permissions/${id}/approve`, {
        approvedBy: user?.id,
      });
      success("Permission approved successfully");
      fetchPermissions();
    } catch (err) {
      error(err?.response?.data?.message || "Failed to approve permission");
    }
  };

  // Reject Permission
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingPermission) return;
    try {
      await api.patch(`/permissions/${rejectingPermission.id}/reject`, {
        approvedBy: user?.id,
        notes: rejectionNotes.trim() || null,
      });
      success("Permission request rejected");
      setRejectingPermission(null);
      setRejectionNotes("");
      fetchPermissions();
    } catch (err) {
      error(err?.response?.data?.message || "Failed to reject permission");
    }
  };

  // Delete Permission
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/permissions/${confirmDeleteId}`);
      success("Permission request deleted successfully");
      setConfirmDeleteId(null);
      fetchPermissions();
    } catch {
      error("Failed to delete permission request");
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      render: (_, index) => index + 1,
    },
    {
      header: "Requester",
      accessor: "userId",
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.user?.fullName || `User #${row.userId}`}</div>
          <div className="text-xs text-gray-500">{row.user?.email || `ID #${row.userId}`}</div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      render: (row) => {
        const t = PERMISSION_TYPES.find((item) => item.value === row.type) || PERMISSION_TYPES[0];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${t.color}`}>
            {t.label}
          </span>
        );
      },
    },
    {
      header: "Date Range",
      accessor: "fromDate",
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            From: {row.fromDate}
          </div>
          {row.toDate ? (
            <div className="text-gray-500">To: {row.toDate}</div>
          ) : (
            <div className="text-gray-400 italic">Single Day</div>
          )}
        </div>
      ),
    },
    {
      header: "Reason",
      accessor: "reason",
      render: (row) => (
        <p className="text-xs max-w-xs line-clamp-2 text-gray-600 dark:text-gray-300">
          {row.reason}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const meta = STATUS_BADGES[row.status] || STATUS_BADGES.PENDING;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        );
      },
    },
    {
      header: "Approver",
      accessor: "approvedBy",
      render: (row) =>
        row.approver ? (
          <div className="text-xs">
            <div className="font-medium text-gray-800 dark:text-gray-200">{row.approver.fullName}</div>
            {row.approvedAt && (
              <div className="text-[11px] text-gray-500">
                {new Date(row.approvedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* View Details */}
          <button
            title="View Details"
            onClick={() => setViewingPermission(row)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
          >
            <FiEye size={16} />
          </button>

          {/* Approve (Only Pending) */}
          {row.status === "PENDING" && (
            <>
              <button
                title="Approve Request"
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition"
              >
                <FiCheckCircle size={16} />
              </button>

              <button
                title="Reject Request"
                onClick={() => {
                  setRejectingPermission(row);
                  setRejectionNotes("");
                }}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition"
              >
                <FiXCircle size={16} />
              </button>
            </>
          )}

          {/* Edit (Pending Only) */}
          <button
            title={row.status === "PENDING" ? "Edit Request" : "Only pending requests can be edited"}
            disabled={row.status !== "PENDING"}
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <FiEdit size={16} />
          </button>

          {/* Delete */}
          <button
            title="Delete Request"
            onClick={() => setConfirmDeleteId(row.id)}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // UI styling
  const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className={`p-6 rounded-xl shadow border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${cardBg}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <FiShield className="text-blue-500 text-xl" />
            <h2 className={`text-xl font-bold ${textColor}`}>Leave & Absence Permissions</h2>
          </div>
          <p className={`text-xs mt-1 ${subTextColor}`}>
            Request, manage, approve, or reject student and staff leave permissions
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className={`${theme.primary} text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow flex items-center gap-2 hover:opacity-90 transition`}
        >
          <FiPlus size={18} />
          <span>Request Permission</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl shadow border flex flex-col items-center justify-center ${cardBg}`}>
          <span className={`text-2xl font-bold ${textColor}`}>{stats.total}</span>
          <span className={`text-xs mt-1 ${subTextColor}`}>Total Requests</span>
        </div>
        <div className={`p-4 rounded-xl shadow border flex flex-col items-center justify-center ${cardBg}`}>
          <span className="text-2xl font-bold text-yellow-500">{stats.pending}</span>
          <span className={`text-xs mt-1 ${subTextColor}`}>Pending Approvals</span>
        </div>
        <div className={`p-4 rounded-xl shadow border flex flex-col items-center justify-center ${cardBg}`}>
          <span className="text-2xl font-bold text-green-500">{stats.approved}</span>
          <span className={`text-xs mt-1 ${subTextColor}`}>Approved</span>
        </div>
        <div className={`p-4 rounded-xl shadow border flex flex-col items-center justify-center ${cardBg}`}>
          <span className="text-2xl font-bold text-red-500">{stats.rejected}</span>
          <span className={`text-xs mt-1 ${subTextColor}`}>Rejected</span>
        </div>
      </div>

      {/* Main Table & Filters */}
      <div className={`p-6 rounded-xl shadow border space-y-4 ${cardBg}`}>
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FiFilter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-1.5 rounded border text-xs ${inputBg}`}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-1.5 rounded border text-xs ${inputBg}`}
          >
            <option value="">All Types</option>
            <option value="LEAVE">Leave</option>
            <option value="VISIT">Visit</option>
            <option value="MEDICAL">Medical</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className={`px-3 py-1.5 rounded border text-xs ${inputBg}`}
          >
            <option value="">All Users</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs">
            <span className={subTextColor}>From:</span>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className={`px-2 py-1 rounded border text-xs ${inputBg}`}
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className={subTextColor}>To:</span>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className={`px-2 py-1 rounded border text-xs ${inputBg}`}
            />
          </div>

          {(filterStatus || filterType || filterUserId || filterFromDate || filterToDate) && (
            <button
              onClick={() => {
                setFilterStatus("");
                setFilterType("");
                setFilterUserId("");
                setFilterFromDate("");
                setFilterToDate("");
              }}
              className="text-xs text-blue-500 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Loading permissions...</div>
        ) : (
          <DataTable columns={columns} data={permissions} />
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3 className={`text-base font-semibold ${textColor}`}>
                {editingPermission ? `Edit Permission Request (ID #${editingPermission.id})` : "New Permission Request"}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              {formError && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded px-3 py-2 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300">
                  {formError}
                </div>
              )}

              {/* Requester */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Requester (User)
                </label>
                <select
                  required
                  value={formData.userId}
                  disabled={Boolean(editingPermission)}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                >
                  <option value="">Select requester...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email || `ID #${u.id}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Permission Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                >
                  {PERMISSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                    To Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Reason / Purpose
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={3}
                  placeholder="Explain the reason for leave or absence..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                />
              </div>

              {/* Additional Remarks */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Additional Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any additional remarks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBg}`}
                />
              </div>

              {/* Footer */}
              <div
                className={`pt-4 border-t flex justify-end gap-3 ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className={`px-4 py-2 rounded border ${
                    isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`${theme.primary} text-white px-5 py-2 rounded font-medium disabled:opacity-50`}
                >
                  {submitting ? "Submitting..." : editingPermission ? "Update Request" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3 className={`text-base font-semibold ${textColor}`}>
                Permission Request Details (ID #{viewingPermission.id})
              </h3>
              <button
                onClick={() => setViewingPermission(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type: {viewingPermission.type}
                </span>

                {(() => {
                  const meta = STATUS_BADGES[viewingPermission.status] || STATUS_BADGES.PENDING;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              <div className={`p-3 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <span className="block text-xs font-semibold text-gray-500">Requester</span>
                <span className={`font-medium ${textColor}`}>
                  {viewingPermission.user?.fullName} ({viewingPermission.user?.email || `ID #${viewingPermission.userId}`})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <span className="block text-xs font-semibold text-gray-500">From Date</span>
                  <span className={`font-medium ${textColor}`}>{viewingPermission.fromDate}</span>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <span className="block text-xs font-semibold text-gray-500">To Date</span>
                  <span className={`font-medium ${textColor}`}>{viewingPermission.toDate || "N/A"}</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <span className="block text-xs font-semibold text-gray-500">Reason</span>
                <p className={`whitespace-pre-wrap ${textColor}`}>{viewingPermission.reason}</p>
              </div>

              {viewingPermission.notes && (
                <div className={`p-4 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <span className="block text-xs font-semibold text-gray-500">Notes / Approver Remarks</span>
                  <p className={`whitespace-pre-wrap ${textColor}`}>{viewingPermission.notes}</p>
                </div>
              )}

              {viewingPermission.approver && (
                <div className={`p-3 rounded-lg border space-y-1 ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                  <span className="block text-xs font-semibold text-gray-500">Reviewed By</span>
                  <div className={`text-xs ${textColor}`}>
                    {viewingPermission.approver.fullName} on{" "}
                    {viewingPermission.approvedAt ? new Date(viewingPermission.approvedAt).toLocaleString() : ""}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`px-6 py-3 border-t flex justify-end ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setViewingPermission(null)}
                className={`px-4 py-2 rounded border text-xs ${
                  isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectingPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-xl shadow-xl border overflow-hidden ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <h3 className={`text-base font-semibold ${textColor}`}>
                Reject Permission Request (ID #{rejectingPermission.id})
              </h3>
              <button
                onClick={() => setRejectingPermission(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-4 text-sm">
              <p className={`text-xs ${subTextColor}`}>
                Provide a reason or remarks for rejecting this permission request.
              </p>

              <div>
                <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                  Rejection Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter rejection notes..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-red-400 ${inputBg}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPermission(null)}
                  className={`px-4 py-2 rounded border text-xs ${
                    isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs bg-red-600 hover:bg-red-700 text-white font-medium shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`p-6 rounded-xl shadow-xl border w-full max-w-sm ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Delete Permission Request</h3>
            <p className={`text-xs mb-5 ${subTextColor}`}>
              Are you sure you want to delete this permission request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className={`px-4 py-2 text-xs rounded border ${
                  isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs rounded bg-red-600 hover:bg-red-700 text-white font-medium shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
