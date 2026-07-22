// ─── Attendance Status ────────────────────────────────────────────────────────

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"
  | "BY_PERMISSION";

export const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
  "BY_PERMISSION",
];

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
  BY_PERMISSION: "By Permission",
};

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "text-green-600",
  ABSENT: "text-red-600",
  LATE: "text-yellow-600",
  EXCUSED: "text-blue-600",
  BY_PERMISSION: "text-purple-600",
};

export const STATUS_BG_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-50 border-green-200",
  ABSENT: "bg-red-50 border-red-200",
  LATE: "bg-yellow-50 border-yellow-200",
  EXCUSED: "bg-blue-50 border-blue-200",
  BY_PERMISSION: "bg-purple-50 border-purple-200",
};

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface CourseAssignment {
  id: number;
  classId: number;
  teacherId: number;
  class?: { id: number; className: string };
  course?: { id: number; courseName: string };
  teacher?: { id: number; fullName: string };
  academicYear?: { id: number; yearName: string };
}

export interface EnrolledStudent {
  enrollmentId: number;
  fullName: string;
  phone?: string;
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  remark: string;
}

/** Map of enrollmentId → AttendanceEntry — used across all attendance components */
export type AttendanceMap = Record<number, AttendanceEntry>;

// ─── View Models (returned by GET /attendance and GET /attendance/:id) ─────────

export interface AttendanceStatistics {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  byPermission: number;
}

export interface AttendanceStudentRecord {
  attendanceDetailId: number;
  enrollmentId: number;
  studentId: number;
  fullName: string;
  status: AttendanceStatus;
  remark?: string;
}

export interface AttendanceRecord {
  id: number;
  attendanceDate: string;
  remark?: string;
  teacher?: { id: number; fullName: string };
  course?: { id: number; courseName: string };
  class?: { id: number; className: string };
  academicYear?: { id: number; yearName: string };
  statistics: AttendanceStatistics;
  students: AttendanceStudentRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute live attendance counts from an AttendanceMap.
 * Used by AttendanceStatsBar when taking attendance.
 */
export function computeStats(
  attendance: AttendanceMap
): Record<AttendanceStatus, number> {
  const counts = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
    BY_PERMISSION: 0,
  } as Record<AttendanceStatus, number>;

  Object.values(attendance).forEach((entry) => {
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
  });

  return counts;
}

/**
 * Build a fresh AttendanceMap from an enrolled student list
 * with every student defaulted to PRESENT.
 */
export function buildInitialAttendance(
  students: EnrolledStudent[]
): AttendanceMap {
  const map: AttendanceMap = {};
  students.forEach((s) => {
    map[s.enrollmentId] = { status: "PRESENT", remark: "" };
  });
  return map;
}

/**
 * Build an AttendanceMap from a saved attendance record
 * (used when pre-populating an edit view).
 */
export function buildAttendanceFromRecord(
  students: AttendanceStudentRecord[]
): AttendanceMap {
  const map: AttendanceMap = {};
  students.forEach((s) => {
    map[s.enrollmentId] = { status: s.status, remark: s.remark ?? "" };
  });
  return map;
}
