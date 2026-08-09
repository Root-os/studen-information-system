// ─── Enums ────────────────────────────────────────────────────────────────────

export type PartyType = "student" | "teacher";
export type Category =
  | "teacher_to_student"
  | "student_to_teacher"
  | "student_to_student";
export type Status = "pending" | "in_progress" | "resolved" | "rejected";

// ─── Domain objects ───────────────────────────────────────────────────────────

export interface Party {
  id: number;
  fullName: string;
  studentId?: string;
  userName?: string;
}

export interface ClassOption {
  id: number;
  className: string;
}

export interface AcademicYearOption {
  id: number;
  yearName: string;
  isCurrent?: boolean;
}

export interface RespondantOptions {
  students: Party[];
  teachers: Party[];
}

export interface ComplaintRecord {
  id: number;
  complainant: number;
  complainantType: PartyType;
  respondant: number;
  respondantType: PartyType;
  classId: number;
  academicYearId: number;
  category: Category;
  complaint: string;
  status: Status;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  complainantStudent?: Party | null;
  complainantTeacher?: Party | null;
  respondantStudent?: Party | null;
  respondantTeacher?: Party | null;
  complainClass?: { id: number; className: string } | null;
  complainAcademicYear?: { id: number; yearName: string } | null;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  byCategory?: Array<{ category: Category; count: number }>;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const STATUS_META: Record<
  Status,
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
    dot: "bg-red-500",
  },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  teacher_to_student: "Teacher → Student",
  student_to_teacher: "Student → Teacher",
  student_to_student: "Student → Student",
};

export function getPartyName(
  c: ComplaintRecord,
  side: "complainant" | "respondant"
): string {
  const type = side === "complainant" ? c.complainantType : c.respondantType;
  const student = side === "complainant" ? c.complainantStudent : c.respondantStudent;
  const teacher = side === "complainant" ? c.complainantTeacher : c.respondantTeacher;
  if (type === "student" && student) {
    return `${student.fullName}${student.studentId ? ` (${student.studentId})` : ""}`;
  }
  if (type === "teacher" && teacher) {
    return `${teacher.fullName}${teacher.userName ? ` (@${teacher.userName})` : ""}`;
  }
  return `ID #${side === "complainant" ? c.complainant : c.respondant} (${type})`;
}
