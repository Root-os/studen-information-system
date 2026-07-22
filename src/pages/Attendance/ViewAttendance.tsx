import React, { useEffect, useState, useContext } from "react";
import { FaEye } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import api from "../../hooks/api";
import ThemeContext from "../../components/layout/ThemeContext";
import DataTable from "../../components/ui/simpletable";
import ConfirmModal from "../../components/ui/deleteConfirmationModal";
import StatusModal from "../../components/ui/successModal";
import ViewModal from "../../components/ui/detailModal";

import AttendanceStatsBar from "../../components/attendance/AttendanceStatsBar";
import AttendanceStudentTable from "../../components/attendance/AttendanceStudentTable";
import type { AttendanceRecord } from "../../components/attendance/attendanceTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by GET /attendance (list row — no students array) */
interface AttendanceListRow {
  id: number;
  attendanceDate: string;
  teacher?: { id: number; fullName: string };
  course?: { id: number; courseName: string };
  class?: { id: number; className: string };
  academicYear?: { id: number; yearName: string };
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  byPermission: number;
}

interface StatusModalState {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function AttendanceView() {
  const { theme, currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [attendanceData, setAttendanceData] = useState<AttendanceListRow[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceListRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance");
      setAttendanceData(res.data.data || []);
    } catch (err: any) {
      showStatus(
        "error",
        "Load Failed",
        err?.response?.data?.message || "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ── View detail ────────────────────────────────────────────────────────────
  const handleView = async (id: number) => {
    try {
      const res = await api.get(`/attendance/${id}`);
      setSelectedRecord(res.data.data);
    } catch (err: any) {
      showStatus(
        "error",
        "Load Failed",
        err?.response?.data?.message || "Failed to load attendance details"
      );
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedAttendance) return;

    try {
      setDeleting(true);
      await api.delete(`/attendance/${selectedAttendance.id}`);
      setAttendanceData((prev) =>
        prev.filter((item) => item.id !== selectedAttendance.id)
      );
      if (selectedRecord?.id === selectedAttendance.id) setSelectedRecord(null);
      showStatus("success", "Deleted", "Attendance deleted successfully");
      setDeleteModalOpen(false);
      setSelectedAttendance(null);
    } catch (err: any) {
      showStatus(
        "error",
        "Delete Failed",
        err?.response?.data?.message || "Failed to delete attendance"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Date",
      accessor: "attendanceDate",
    },
    {
      header: "Class",
      accessor: "class",
      render: (row: AttendanceListRow) => row.class?.className || "—",
    },
    {
      header: "Course",
      accessor: "course",
      render: (row: AttendanceListRow) => row.course?.courseName || "—",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      render: (row: AttendanceListRow) => row.teacher?.fullName || "—",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      render: (row: AttendanceListRow) => row.academicYear?.yearName || "—",
    },
    {
      header: "Summary",
      accessor: "summary",
      render: (row: AttendanceListRow) => (
        <span className="text-xs space-x-2">
          <span className="text-green-600 font-medium">P:{row.present}</span>
          <span className="text-red-600 font-medium">A:{row.absent}</span>
          <span className="text-yellow-600 font-medium">L:{row.late}</span>
          <span className="text-blue-600 font-medium">E:{row.excused}</span>
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: AttendanceListRow) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleView(row.id)}
            className="text-blue-500 p-2 hover:bg-blue-100 rounded"
            title="View details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => {
              setSelectedAttendance(row);
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
        Loading attendance records…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div
        className={`p-6 rounded shadow flex justify-between items-center ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className={`text-xl font-bold ${theme.text}`}>
          Attendance Records
        </h2>
      </div>

      {/* ── Records Table ── */}
      <div
        className={`p-6 rounded shadow ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <DataTable columns={columns} data={attendanceData} />
      </div>

      {/* ── Detail Modal ── */}
      <ViewModal
        open={!!selectedRecord}
        title="Attendance Details"
        size="xl"
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <div className="space-y-6">

            {/* Session info */}
            <div>
              <h3 className="text-xl font-bold">
                {selectedRecord.class?.className} —{" "}
                {selectedRecord.course?.courseName}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Teacher:</span>{" "}
                  {selectedRecord.teacher?.fullName}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {selectedRecord.attendanceDate}
                </p>
                <p>
                  <span className="font-semibold">Academic Year:</span>{" "}
                  {selectedRecord.academicYear?.yearName}
                </p>
              </div>
            </div>

            {/* ── Stats bar (reusing shared component) ── */}
            <AttendanceStatsBar
              statistics={selectedRecord.statistics}
              showTotal
            />

            {/* ── Student list (reusing shared component, read-only mode) ── */}
            <AttendanceStudentTable records={selectedRecord.students} />
          </div>
        )}
      </ViewModal>

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record? This cannot be undone."
        loading={deleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedAttendance(null);
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

export default AttendanceView;
