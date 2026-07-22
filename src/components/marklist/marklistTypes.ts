// ─── Shared Types & Helpers for MarkList ─────────────────────────────────────
// Mirrors attendanceTypes.ts

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface CourseAssignment {
  id: number;
  classId: number;
  courseId: number;
  teacherId: number;
  academicYearId: number;
  class?: { id: number; className: string };
  course?: { id: number; courseName: string };
  teacher?: { id: number; fullName: string; phone?: string; userName?: string };
  academicYear?: { id: number; yearName: string };
}

/** A student enrolled in a class — used when loading the mark entry form */
export interface EnrolledStudent {
  enrollmentId: number;
  fullName: string;
  phone?: string;
  status?: string; // enrollment status
}

// ─── Mark Entry Map (used while filling in marks) ────────────────────────────

/** key = enrollmentId */
export type MarkMap = Record<number, number | "">;

/**
 * Build a blank MarkMap for a list of students.
 * Default mark is empty string (user must fill in).
 */
export function buildInitialMarkMap(students: EnrolledStudent[]): MarkMap {
  return Object.fromEntries(students.map((s) => [s.enrollmentId, ""]));
}

// ─── Grade helpers ────────────────────────────────────────────────────────────

/** Return letter grade from a 0–100 numeric mark */
export function getGrade(mark: number): string {
  if (mark >= 90) return "A+";
  if (mark >= 85) return "A";
  if (mark >= 80) return "B+";
  if (mark >= 75) return "B";
  if (mark >= 70) return "C+";
  if (mark >= 65) return "C";
  if (mark >= 60) return "D+";
  if (mark >= 50) return "D";
  return "F";
}

/** Tailwind color class for a grade string */
export function getGradeColor(mark: number): string {
  if (mark >= 80) return "text-green-600";
  if (mark >= 65) return "text-blue-600";
  if (mark >= 50) return "text-yellow-600";
  return "text-red-600";
}

// ─── MarkList Stats ───────────────────────────────────────────────────────────

export interface MarkListStats {
  total: number;
  highest: number;
  lowest: number;
  average: number;
  passed: number;
  failed: number;
}

/** Compute live stats from a MarkMap (only counts filled-in marks) */
export function computeMarkStats(marks: MarkMap): MarkListStats {
  const values = Object.values(marks)
    .filter((v): v is number => v !== "" && !isNaN(Number(v)))
    .map(Number);

  if (values.length === 0) {
    return { total: 0, highest: 0, lowest: 0, average: 0, passed: 0, failed: 0 };
  }

  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const passed = values.filter((v) => v >= 50).length;
  const failed = values.length - passed;

  return { total: values.length, highest, lowest, average, passed, failed };
}

// ─── API Response Types ───────────────────────────────────────────────────────

/** A single mark detail row inside a MarkList detail response */
export interface MarkDetailItem {
  id: number;          // MarkDetail.id (used for PUT /detail/:id)
  mark: number;
  createdAt: string;
  updatedAt?: string;
  enrollment: {
    id: number;
    enrollmentDate: string;
    status: string;
  };
  student: {
    id: number;
    fullName: string;
    phone?: string;
  };
}

/** Full MarkList record returned by GET /marklists/:id */
export interface MarkListRecord {
  id: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  courseAssignment: {
    id: number;
    course: { id: number; courseName: string };
    class: { id: number; className: string };
    teacher: { id: number; fullName: string; phone?: string; userName?: string };
    academicYear: { id: number; yearName: string };
  };
  marks: MarkDetailItem[];
}

/** Summary row returned by GET /marklists (list view — no marks array) */
export interface MarkListRow {
  id: number;
  createdAt: string;
  updatedAt: string;
  courseAssignment: {
    id: number;
    course: { id: number; courseName: string };
    class: { id: number; className: string };
    teacher: { id: number; fullName: string; phone?: string; userName?: string };
    academicYear: { id: number; yearName: string };
  };
  marks: MarkDetailItem[]; // included in list response (the controller returns it)
}
