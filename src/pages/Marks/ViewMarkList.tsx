import React, { useEffect, useState, useContext } from "react";
import { FaEye } from "react-icons/fa";
import { FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";
import ViewModal from "../../components/ui/detailModal";

import MarkStatsBar from "../../components/marklist/MarkStatsBar";
import MarkStudentTable from "../../components/marklist/MarkStudentTable";
import type {
  MarkListRow,
  MarkListRecord,
  MarkDetailItem,
  MarkListStats,
} from "../../components/marklist/marklistTypes";
import { computeMarkStats } from "../../components/marklist/marklistTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusModalState {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ViewMarkList() {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // ── List state ─────────────────────────────────────────────────────────────
  const [markLists, setMarkLists] = useState<MarkListRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ── View / detail state ────────────────────────────────────────────────────
  const [selectedRecord, setSelectedRecord] = useState<MarkListRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MarkListRecord | null>(null);
  /** key = MarkDetail.id */
  const [editMarks, setEditMarks] = useState<Record<number, number | "">>({});
  const [saving, setSaving] = useState(false);
  /** ID of the MarkDetail row currently being deleted (null = none) */
  const [deletingMarkId, setDeletingMarkId] = useState<number | null>(null);

  // ── Delete state ───────────────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MarkListRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Status modal ───────────────────────────────────────────────────────────
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

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchMarkLists = async () => {
    try {
      setLoading(true);
      const res = await api.get("/marks");
      setMarkLists(res.data.data || []);
    } catch (err: any) {
      showStatus("error", "Load Failed", err?.response?.data?.message || "Failed to load mark lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkLists();
  }, []);

  // ── View detail ────────────────────────────────────────────────────────────
  const handleView = async (id: number) => {
    try {
      const res = await api.get(`/marks/${id}`);
      setSelectedRecord(res.data.data);
      setViewModalOpen(true);
    } catch (err: any) {
      showStatus("error", "Load Failed", err?.response?.data?.message || "Failed to load mark list details");
    }
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const handleOpenEdit = async (id: number) => {
    try {
      const res = await api.get(`/marks/${id}`);
      const record: MarkListRecord = res.data.data;
      setEditRecord(record);
      // Seed editMarks with the current saved values (key = detail.id)
      const initial: Record<number, number | ""> = {};
      record.marks.forEach((d) => {
        initial[d.id] = d.mark;
      });
      setEditMarks(initial);
      setEditModalOpen(true);
    } catch (err: any) {
      showStatus("error", "Load Failed", err?.response?.data?.message || "Failed to load mark list for editing");
    }
  };

  // ── Submit edit (PUT /marklists/:id — update full list) ───────────────────
  const handleSaveEdit = async () => {
    if (!editRecord) return;

    // Validate
    const invalid = editRecord.marks.some((d) => {
      const v = editMarks[d.id];
      return v === "" || v === undefined || Number(v) < 0 || Number(v) > 100;
    });
    if (invalid) {
      showStatus("error", "Invalid Marks", "All marks must be between 0 and 100");
      return;
    }

    const payload = {
      marks: editRecord.marks.map((d) => ({
        enrollmentId: d.enrollment.id,
        mark: Number(editMarks[d.id]),
      })),
    };

    try {
      setSaving(true);
      await api.put(`/marks/${editRecord.id}`, payload);
      showStatus("success", "Updated", "Mark list updated successfully");
      setEditModalOpen(false);
      setEditRecord(null);
      fetchMarkLists();
    } catch (err: any) {
      showStatus("error", "Update Failed", err?.response?.data?.message || "Failed to update mark list");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete a single student's mark row (inside edit modal) ─────────────────
  const handleDeleteMark = async (detailId: number) => {
    if (!editRecord) return;
    try {
      setDeletingMarkId(detailId);
      await api.delete(`/marks/detail/${detailId}`);
      // Remove the row from local state so the table updates immediately
      setEditRecord((prev) =>
        prev
          ? { ...prev, marks: prev.marks.filter((m) => m.id !== detailId) }
          : prev
      );
      setEditMarks((prev) => {
        const next = { ...prev };
        delete next[detailId];
        return next;
      });
      showStatus("success", "Deleted", "Student mark removed successfully");
    } catch (err: any) {
      showStatus("error", "Delete Failed", err?.response?.data?.message || "Failed to delete mark");
    } finally {
      setDeletingMarkId(null);
    }
  };

  // ── Delete entire mark list ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/marks/${toDelete.id}`);
      setMarkLists((prev) => prev.filter((item) => item.id !== toDelete.id));
      if (selectedRecord?.id === toDelete.id) {
        setSelectedRecord(null);
        setViewModalOpen(false);
      }
      showStatus("success", "Deleted", "Mark list deleted successfully");
      setDeleteModalOpen(false);
      setToDelete(null);
    } catch (err: any) {
      showStatus("error", "Delete Failed", err?.response?.data?.message || "Failed to delete mark list");
    } finally {
      setDeleting(false);
    }
  };

  // ── Derive summary stats from a marks array ────────────────────────────────
  const deriveStats = (marks: MarkDetailItem[]): MarkListStats => {
    const map: Record<number, number | ""> = {};
    marks.forEach((_, i) => { map[i] = marks[i].mark; });
    return computeMarkStats(map);
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Class",
      accessor: "class",
      render: (row: MarkListRow) => row.courseAssignment?.class?.className || "—",
    },
    {
      header: "Course",
      accessor: "course",
      render: (row: MarkListRow) => row.courseAssignment?.course?.courseName || "—",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      render: (row: MarkListRow) => row.courseAssignment?.teacher?.fullName || "—",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      render: (row: MarkListRow) => row.courseAssignment?.academicYear?.yearName || "—",
    },
    {
      header: "Students",
      accessor: "students",
      render: (row: MarkListRow) => row.marks?.length ?? 0,
    },
    {
      header: "Summary",
      accessor: "summary",
      render: (row: MarkListRow) => {
        if (!row.marks?.length) return <span className="text-gray-400 text-xs">—</span>;
        const vals = row.marks.map((m) => m.mark);
        const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
        const passed = vals.filter((v) => v >= 50).length;
        return (
          <span className="text-xs space-x-2">
            <span className="text-blue-600 font-medium">Avg: {avg}</span>
            <span className="text-green-600 font-medium">P: {passed}</span>
            <span className="text-red-600 font-medium">F: {vals.length - passed}</span>
          </span>
        );
      },
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (row: MarkListRow) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: MarkListRow) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row.id)}
            className="text-blue-500 p-2 hover:bg-blue-100 rounded"
            title="View details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleOpenEdit(row.id)}
            className="text-green-600 p-2 hover:bg-green-100 rounded"
            title="Edit marks"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => {
              setToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="text-red-500 p-2 hover:bg-red-100 rounded"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-400">
        Loading mark lists…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className={`p-6 rounded shadow flex justify-between items-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-bold ${theme.text}`}>Mark Lists</h2>
      </div>

      {/* ── Records Table ── */}
      <div className={`p-6 rounded shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <DataTable columns={columns} data={markLists} />
      </div>

      {/* ── View Detail Modal ── */}
      <ViewModal
        open={viewModalOpen}
        title="Mark List Details"
        size="xl"
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRecord(null);
        }}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <h3 className="text-xl font-bold">
                {selectedRecord.courseAssignment.class?.className} —{" "}
                {selectedRecord.courseAssignment.course?.courseName}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Teacher:</span>{" "}
                  {selectedRecord.courseAssignment.teacher?.fullName}
                </p>
                <p>
                  <span className="font-semibold">Academic Year:</span>{" "}
                  {selectedRecord.courseAssignment.academicYear?.yearName}
                </p>
                <p>
                  <span className="font-semibold">Recorded:</span>{" "}
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Stats bar (computed from records) */}
            <MarkStatsBar statistics={deriveStats(selectedRecord.marks)} />

            {/* Student mark table — read-only */}
            <MarkStudentTable records={selectedRecord.marks} />
          </div>
        )}
      </ViewModal>

      {/* ── Edit Modal ── */}
      <ViewModal
        open={editModalOpen}
        title="Edit Mark List"
        size="xl"
        onClose={() => {
          setEditModalOpen(false);
          setEditRecord(null);
        }}
        footer={
          <>
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditRecord(null);
              }}
              disabled={saving}
              className={`flex items-center gap-1 px-4 py-2 rounded border text-sm ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FiX size={14} />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-medium text-white ${
                saving ? "bg-gray-500 cursor-not-allowed" : theme.primary
              }`}
            >
              <FiCheck size={14} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </>
        }
      >
        {editRecord && (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <h3 className="text-xl font-bold">
                {editRecord.courseAssignment.class?.className} —{" "}
                {editRecord.courseAssignment.course?.courseName}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Teacher:</span>{" "}
                  {editRecord.courseAssignment.teacher?.fullName}
                </p>
                <p>
                  <span className="font-semibold">Academic Year:</span>{" "}
                  {editRecord.courseAssignment.academicYear?.yearName}
                </p>
              </div>
            </div>

            {/* Live stats while editing */}
            {(() => {
              // Build a MarkMap keyed by index for stat computation
              const liveMap: Record<number, number | ""> = {};
              editRecord.marks.forEach((d, i) => {
                liveMap[i] = editMarks[d.id] ?? d.mark;
              });
              return <MarkStatsBar marks={liveMap} />;
            })()}

            {/* Editable student table */}
            <MarkStudentTable
              records={editRecord.marks}
              editMarks={editMarks}
              onEditMarkChange={(detailId, value) =>
                setEditMarks((prev) => ({ ...prev, [detailId]: value }))
              }
              onDeleteRecord={handleDeleteMark}
              deletingMarkId={deletingMarkId}
            />
          </div>
        )}
      </ViewModal>

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Mark List"
        message="Are you sure you want to delete this entire mark list? All student marks will be permanently removed."
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleDelete}
      />

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
}

export default ViewMarkList;
