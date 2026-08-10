import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../components/layout/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import api from "../hooks/api";
import {
  FiUsers, FiUserCheck, FiBookOpen, FiClipboard,
  FiAlertCircle, FiFileText, FiGrid, FiBriefcase,
  FiLayers, FiTrendingUp, FiRefreshCw, FiExternalLink,
  FiMessageSquare, FiCheckCircle, FiClock, FiXCircle,
  FiCalendar, FiBarChart2, FiInbox, FiSend,
} from "react-icons/fi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString());

const pct = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Top-level KPI card */
const StatCard = ({ icon: Icon, label, value, sub, accent, isDark, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-xl p-5 shadow border flex flex-col gap-3 transition-all duration-200
      ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:shadow-md"}
      ${onClick ? "cursor-pointer" : ""}
    `}
  >
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      {onClick && <FiExternalLink size={14} className={isDark ? "text-gray-500" : "text-gray-400"} />}
    </div>
    <div>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(value)}</p>
      <p className={`text-sm font-medium mt-0.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</p>
      {sub && <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>}
    </div>
  </div>
);

/** Section wrapper */
const Section = ({ title, children, isDark, action }) => (
  <div className={`rounded-xl shadow border p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

/** Horizontal progress bar row */
const BarRow = ({ label, value, total, color, isDark }) => {
  const width = pct(value, total);
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
        <span className={`text-xs font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {fmt(value)} <span className={`font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}>({width}%)</span>
        </span>
      </div>
      <div className={`h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

/** Complaint status pill */
const StatusPill = ({ label, value, color, isDark }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
    </div>
    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(value)}</span>
  </div>
);

/** Quick-link button */
const QuickLink = ({ icon: Icon, label, to, accent, isDark, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center
      ${isDark ? "bg-gray-700 border-gray-600 hover:bg-gray-650 text-gray-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"}
    `}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
      <Icon size={18} className="text-white" />
    </div>
    <span className="text-xs font-medium leading-tight">{label}</span>
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const HomePage = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDark = currentTheme === "dark";

  // ── Raw data ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    users: { total: null, active: null, inactive: null, student: null, regullar: null, unique_regular: null, honorary_members: null },
    teachers: null,
    staff: null,
    departments: null,
    classes: null,
    courses: null,
    enrollments: { total: null, active: null },
    complaints: { total: null, pending: null, in_progress: null, resolved: null, rejected: null },
    blogs: null,
    letters: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Fetch all stats in parallel ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        usersRes, teachersRes, staffRes, departmentsRes,
        classesRes, coursesRes, enrollmentsRes,
        complaintStatsRes, blogsRes, lettersRes,
      ] = await Promise.allSettled([
        api.get("/users"),
        api.get("/teacher"),
        api.get("/staff"),
        api.get("/department"),
        api.get("/class"),
        api.get("/courses"),
        api.get("/enrollments"),
        api.get("/complaints/stats/summary"),
        api.get("/blogs"),
        api.get("/letter"),
      ]);

      // ── Users ──
      const usersRaw =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.data ?? usersRes.value.data ?? []
          : [];
      const usersArr = Array.isArray(usersRaw) ? usersRaw : [];
      const active = usersArr.filter((u) => u.status === "ACTIVE").length;
      const inactive = usersArr.filter((u) => u.status === "INACTIVE").length;
      const student = usersArr.filter((u) => u.category === "student").length;
      const regullar = usersArr.filter((u) => u.category === "regullar").length;
      const unique_regular = usersArr.filter((u) => u.category === "unique_regular").length;
      const honorary_members = usersArr.filter((u) => u.category === "honorary_members").length;

      // ── Enrollments ──
      const enrollmentsRaw =
        enrollmentsRes.status === "fulfilled"
          ? enrollmentsRes.value.data?.data ?? enrollmentsRes.value.data ?? []
          : [];
      const enrollmentsArr = Array.isArray(enrollmentsRaw) ? enrollmentsRaw : [];
      const activeEnrollments = enrollmentsArr.filter((e) => e.status === "ACTIVE").length;

      // ── Complaint stats ──
      const cStats =
        complaintStatsRes.status === "fulfilled" ? complaintStatsRes.value.data : null;

      // ── Simple counts ──
      const count = (res, path) => {
        if (res.status !== "fulfilled") return null;
        const d = res.value.data;
        if (path) return d?.[path] ?? (Array.isArray(d?.data) ? d.data.length : Array.isArray(d) ? d.length : null);
        return d?.count ?? (Array.isArray(d?.data) ? d.data.length : Array.isArray(d) ? d.length : null);
      };

      setStats({
        users: { total: usersArr.length, active, inactive, student, regullar, unique_regular, honorary_members },
        teachers: count(teachersRes),
        staff: count(staffRes),
        departments: count(departmentsRes),
        classes: count(classesRes),
        courses: count(coursesRes),
        enrollments: { total: enrollmentsArr.length, active: activeEnrollments },
        complaints: cStats
          ? { total: cStats.total, pending: cStats.pending, in_progress: cStats.in_progress, resolved: cStats.resolved, rejected: cStats.rejected }
          : { total: null, pending: null, in_progress: null, resolved: null, rejected: null },
        blogs: count(blogsRes),
        letters: count(lettersRes),
      });
      setLastRefreshed(new Date());
    } catch {
      // partial failures are handled per-promise above
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = user?.fullName ?? user?.userName ?? "Admin";

  // ── Theme accent colours for cards ───────────────────────────────────────
  const accents = {
    blue:   "bg-blue-500",
    green:  "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    dark:   "bg-gray-600",
  };
  const accent = (color) => accents[color] ?? "bg-blue-500";

  // ── KPI cards config ──────────────────────────────────────────────────────
  const kpiCards = [
    { icon: FiUsers,      label: "Registered Users",  value: stats.users.total,        sub: `${fmt(stats.users.active)} active · ${fmt(stats.users.inactive)} inactive`, color: "bg-blue-500",    path: "/view-students" },
    { icon: FiUserCheck,  label: "Enrolled Students", value: stats.enrollments.total,  sub: `${fmt(stats.enrollments.active)} active enrollments`,                         color: "bg-emerald-500", path: "/enrolments" },
    { icon: FiBookOpen,   label: "Teachers",          value: stats.teachers,           sub: "Active faculty members",                                                       color: "bg-violet-500",  path: "/teachers" },
    { icon: FiBriefcase,  label: "Staff Members",     value: stats.staff,              sub: "Administrative staff",                                                         color: "bg-orange-500",  path: "/staffs" },
    { icon: FiGrid,       label: "Departments",       value: stats.departments,        sub: "Active departments",                                                           color: "bg-pink-500",    path: "/departments" },
    { icon: FiLayers,     label: "Classes",           value: stats.classes,            sub: "Registered classes",                                                           color: "bg-cyan-500",    path: "/classes" },
    { icon: FiClipboard,  label: "Courses",           value: stats.courses,            sub: "Available courses",                                                            color: "bg-teal-500",    path: "/courses" },
    { icon: FiAlertCircle,label: "Complaints",        value: stats.complaints.total,   sub: `${fmt(stats.complaints.pending)} pending`,                                     color: "bg-red-500",     path: "/complaints" },
    { icon: FiFileText,   label: "Blog Posts",        value: stats.blogs,              sub: "Published articles",                                                           color: "bg-indigo-500",  path: "/blog" },
    { icon: FiMessageSquare, label: "Letters",        value: stats.letters,            sub: "Official letters issued",                                                      color: "bg-amber-500",   path: "/letter" },
  ];

  const cardBg  = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-6">

      {/* ── Welcome Header ── */}
      <div className={`rounded-xl shadow border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBg}`}>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {greeting}, {displayName} 👋
          </h1>
     {    /* <p className={`text-sm mt-1 ${textSub}`}>
            Here's what's happening across your Sunday School system today.
          </p>*/}
          {lastRefreshed && (
            <p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
            ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
            disabled:opacity-50`}
        >
          <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map(({ icon, label, value, sub, color, path }) => (
          <StatCard
            key={label}
            icon={icon}
            label={label}
            value={loading ? "…" : value}
            sub={loading ? "" : sub}
            accent={color}
            isDark={isDark}
            onClick={() => navigate(path)}
          />
        ))}
      </div>

      {/* ── Row 2: Member breakdown + Complaint status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Member Category Breakdown */}
        <Section title="Member Category Breakdown" isDark={isDark}>
          <BarRow label="Students"         value={stats.users.student}           total={stats.users.total} color="bg-blue-500"    isDark={isDark} />
          <BarRow label="Regular Members"  value={stats.users.regullar}          total={stats.users.total} color="bg-emerald-500" isDark={isDark} />
          <BarRow label="Unique Regular"   value={stats.users.unique_regular}    total={stats.users.total} color="bg-violet-500"  isDark={isDark} />
          <BarRow label="Honorary Members" value={stats.users.honorary_members}  total={stats.users.total} color="bg-orange-500"  isDark={isDark} />
          <div className={`mt-4 pt-3 border-t flex justify-between text-xs ${isDark ? "border-gray-700 text-gray-400" : "border-gray-100 text-gray-500"}`}>
            <span>Total registered: <strong className={isDark ? "text-white" : "text-gray-900"}>{fmt(stats.users.total)}</strong></span>
            <span>Active: <strong className="text-emerald-500">{fmt(stats.users.active)}</strong></span>
            <span>Inactive: <strong className="text-red-400">{fmt(stats.users.inactive)}</strong></span>
          </div>
        </Section>

        {/* Complaint Status */}
        <Section
          title="Complaint Status"
          isDark={isDark}
          action={
            <button onClick={() => navigate("/complaints")}
              className={`text-xs flex items-center gap-1 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
              View all <FiExternalLink size={12} />
            </button>
          }
        >
          <div className="space-y-2">
            <StatusPill label="Pending"     value={stats.complaints.pending}     color="bg-yellow-400" isDark={isDark} />
            <StatusPill label="In Progress" value={stats.complaints.in_progress} color="bg-blue-400"   isDark={isDark} />
            <StatusPill label="Resolved"    value={stats.complaints.resolved}    color="bg-green-400"  isDark={isDark} />
            <StatusPill label="Rejected"    value={stats.complaints.rejected}    color="bg-red-400"    isDark={isDark} />
          </div>
          <div className={`mt-4 pt-3 border-t text-xs ${isDark ? "border-gray-700 text-gray-400" : "border-gray-100 text-gray-500"}`}>
            Total complaints filed: <strong className={isDark ? "text-white" : "text-gray-900"}>{fmt(stats.complaints.total)}</strong>
            {stats.complaints.total > 0 && stats.complaints.resolved != null && (
              <span className="ml-3 text-emerald-500 font-semibold">
                {pct(stats.complaints.resolved, stats.complaints.total)}% resolved
              </span>
            )}
          </div>
        </Section>
      </div>

      {/* ── Row 3: Enrollment overview + Academic snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Enrollment Overview */}
        <Section title="Enrollment Overview" isDark={isDark}>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-emerald-50"}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-gray-400" : "text-emerald-700"}`}>
                Active Enrollments
              </p>
              <p className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-emerald-700"}`}>
                {fmt(stats.enrollments.active)}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-emerald-600"}`}>
                of {fmt(stats.enrollments.total)} total
              </p>
            </div>
            <div className={`h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${pct(stats.enrollments.active, stats.enrollments.total)}%` }}
              />
            </div>
            <p className={`text-xs text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {pct(stats.enrollments.active, stats.enrollments.total)}% active enrollment rate
            </p>
          </div>
        </Section>

        {/* Academic Snapshot */}
        <Section title="Academic Snapshot" isDark={isDark}>
          {[
            { label: "Classes",   value: stats.classes,  icon: FiLayers,    color: "text-cyan-500"   },
            { label: "Courses",   value: stats.courses,  icon: FiClipboard, color: "text-teal-500"   },
            { label: "Teachers",  value: stats.teachers, icon: FiUserCheck, color: "text-violet-500" },
            { label: "Blog Posts",value: stats.blogs,    icon: FiFileText,  color: "text-indigo-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center justify-between py-2.5 border-b last:border-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
              </div>
              <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(value)}</span>
            </div>
          ))}
        </Section>

        {/* People Snapshot */}
        <Section title="People at a Glance" isDark={isDark}>
          {[
            { label: "Registered Users", value: stats.users.total,   icon: FiUsers,        color: "text-blue-500"   },
            { label: "Staff Members",    value: stats.staff,          icon: FiBriefcase,    color: "text-orange-500" },
            { label: "Departments",      value: stats.departments,    icon: FiGrid,         color: "text-pink-500"   },
            { label: "Letters Issued",   value: stats.letters,        icon: FiMessageSquare,color: "text-amber-500"  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center justify-between py-2.5 border-b last:border-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
              </div>
              <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt(value)}</span>
            </div>
          ))}
        </Section>
      </div>

      {/* ── Quick Links ── */}
      <Section title="Quick Actions" isDark={isDark}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[
            { icon: FiUsers,        label: "Add Student",    to: "/register-student",  color: "bg-blue-500"    },
            { icon: FiUserCheck,    label: "Teachers",       to: "/teachers",           color: "bg-violet-500"  },
            { icon: FiTrendingUp,   label: "Enrolments",    to: "/enrolments",         color: "bg-emerald-500" },
            { icon: FiClipboard,    label: "Attendance",     to: "/take-attendance",    color: "bg-cyan-500"    },
            { icon: FiBookOpen,     label: "Mark List",      to: "/fill-marks",         color: "bg-teal-500"    },
            { icon: FiAlertCircle,  label: "Complaints",     to: "/complaints",         color: "bg-red-500"     },
            { icon: FiFileText,     label: "Blog",           to: "/blog",               color: "bg-indigo-500"  },
            { icon: FiMessageSquare,label: "Letters",        to: "/letter",             color: "bg-amber-500"   },
            { icon: FiGrid,         label: "Departments",    to: "/departments",        color: "bg-pink-500"    },
            { icon: FiLayers,       label: "Classes",        to: "/classes",            color: "bg-sky-500"     },
            { icon: FiBriefcase,    label: "Staff",          to: "/staffs",             color: "bg-orange-500"  },
            { icon: FiCheckCircle,  label: "Roles",          to: "/roles",              color: "bg-gray-500"    },
          ].map(({ icon, label, to, color }) => (
            <QuickLink key={label} icon={icon} label={label} to={to} accent={color} isDark={isDark} navigate={navigate} />
          ))}
        </div>
      </Section>

    </div>
  );
};

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

const TeacherDashboard = () => {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDark = currentTheme === "dark";

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // raw data
  const [assignments, setAssignments]     = useState([]);   // course assignments
  const [attendanceSessions, setAttendanceSessions] = useState([]); // attendance records
  const [markLists, setMarkLists]         = useState([]);
  const [myComplaints, setMyComplaints]   = useState([]);   // filed by me
  const [receivedComplaints, setReceivedComplaints] = useState([]); // against me

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [assignRes, attendRes, markRes, filedRes, receivedRes] =
        await Promise.allSettled([
          api.get(`/courseAssign/teacher/${user.id}`),
          api.get("/attendance", { params: { takenBy: user.id } }),
          api.get("/marks", { params: { teacherId: user.id, limit: 100 } }),
          api.get(`/complaints/track/complainant/${user.id}`, { params: { type: "teacher" } }),
          api.get(`/complaints/track/respondant/${user.id}`,  { params: { type: "teacher" } }),
        ]);

      const a = assignRes.status === "fulfilled"
        ? (assignRes.value.data?.data ?? assignRes.value.data ?? []) : [];
      const at = attendRes.status === "fulfilled"
        ? (attendRes.value.data?.data ?? attendRes.value.data ?? []) : [];
      const m = markRes.status === "fulfilled"
        ? (markRes.value.data?.data ?? markRes.value.data ?? []) : [];
      const fc = filedRes.status === "fulfilled"
        ? (filedRes.value.data ?? []) : [];
      const rc = receivedRes.status === "fulfilled"
        ? (receivedRes.value.data ?? []) : [];

      setAssignments(Array.isArray(a) ? a : []);
      setAttendanceSessions(Array.isArray(at) ? at : []);
      setMarkLists(Array.isArray(m) ? m : []);
      setMyComplaints(Array.isArray(fc) ? fc : []);
      setReceivedComplaints(Array.isArray(rc) ? rc : []);
      setLastRefreshed(new Date());
    } catch { /* partial failures handled above */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const uniqueClasses = [...new Set(assignments.map((a) => a.classId))].length;
  const uniqueCourses = [...new Set(assignments.map((a) => a.courseId))].length;

  const filedPending    = myComplaints.filter((c) => c.status === "pending").length;
  const filedResolved   = myComplaints.filter((c) => c.status === "resolved").length;
  const receivedPending = receivedComplaints.filter((c) => c.status === "pending").length;
  const receivedResolved= receivedComplaints.filter((c) => c.status === "resolved").length;

  // Attendance: count distinct students marked across all sessions
  const totalStudentsMarked = attendanceSessions.reduce((sum, s) => {
    const details = s.attendanceDetails ?? s.AttendanceDetails ?? [];
    return sum + details.length;
  }, 0);
  const presentCount = attendanceSessions.reduce((sum, s) => {
    const details = s.attendanceDetails ?? s.AttendanceDetails ?? [];
    return sum + details.filter((d) => d.status === "PRESENT").length;
  }, 0);

  // ── UI helpers ────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const cardBg  = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const rowLine = isDark ? "border-gray-700" : "border-gray-100";

  const kpiCards = [
    { icon: FiLayers,    label: "Classes Assigned",    value: uniqueClasses,            sub: "Distinct classes you teach",           color: "bg-cyan-500",    path: "/take-attendance"   },
    { icon: FiBookOpen,  label: "Courses Assigned",    value: uniqueCourses,            sub: "Distinct courses you cover",           color: "bg-violet-500",  path: "/fill-marks"        },
    { icon: FiClipboard, label: "Total Assignments",   value: assignments.length,       sub: "Class–course combinations",            color: "bg-teal-500",    path: "/courseAssignment"  },
    { icon: FiCalendar,  label: "Attendance Sessions", value: attendanceSessions.length,sub: "Sessions you have recorded",           color: "bg-blue-500",    path: "/view-attendance"   },
    { icon: FiBarChart2, label: "Mark Lists",          value: markLists.length,         sub: "Mark sheets submitted",               color: "bg-indigo-500",  path: "/view-marks"        },
    { icon: FiSend,      label: "Complaints Filed",    value: myComplaints.length,      sub: `${filedPending} pending · ${filedResolved} resolved`,  color: "bg-orange-500",  path: "/complaints" },
    { icon: FiInbox,     label: "Complaints Received", value: receivedComplaints.length,sub: `${receivedPending} pending · ${receivedResolved} resolved`, color: "bg-red-500", path: "/complaints" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Welcome header ── */}
      <div className={`rounded-xl shadow border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBg}`}>
        <div>
          <h1 className={`text-2xl font-bold ${textPri}`}>
            {greeting}, {user?.fullName ?? user?.userName ?? "Teacher"} 👋
          </h1>
          <p className={`text-sm mt-1 ${textSub}`}>
            Here's a summary of your teaching activity for this academic period.
          </p>
          {lastRefreshed && (
            <p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={fetchAll} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
            ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
            disabled:opacity-50`}>
          <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ icon, label, value, sub, color, path }) => (
          <StatCard key={label} icon={icon} label={label}
            value={loading ? "…" : value} sub={loading ? "" : sub}
            accent={color} isDark={isDark} onClick={() => navigate(path)} />
        ))}
      </div>

      {/* ── Row 2: Attendance breakdown + Complaint breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attendance breakdown */}
        <Section title="Attendance Overview" isDark={isDark}
          action={
            <button onClick={() => navigate("/view-attendance")}
              className={`text-xs flex items-center gap-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              View all <FiExternalLink size={12} />
            </button>
          }>
          <div className="space-y-4">
            <div className={`grid grid-cols-2 gap-3`}>
              {[
                { label: "Sessions Recorded", value: attendanceSessions.length, color: "text-blue-500"  },
                { label: "Student–Day Records", value: totalStudentsMarked,     color: "text-cyan-500"  },
                { label: "Present Marks",       value: presentCount,            color: "text-green-500" },
                { label: "Absent / Late Marks", value: totalStudentsMarked - presentCount, color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <p className={`text-xl font-bold ${color}`}>{fmt(loading ? null : value)}</p>
                  <p className={`text-xs mt-0.5 ${textSub}`}>{label}</p>
                </div>
              ))}
            </div>
            {totalStudentsMarked > 0 && (
              <>
                <BarRow label="Present rate" value={presentCount}
                  total={totalStudentsMarked} color="bg-green-500" isDark={isDark} />
                <BarRow label="Absent / Late" value={totalStudentsMarked - presentCount}
                  total={totalStudentsMarked} color="bg-red-400" isDark={isDark} />
              </>
            )}
          </div>
        </Section>

        {/* Complaint breakdown */}
        <Section title="Complaint Summary" isDark={isDark}
          action={
            <button onClick={() => navigate("/complaints")}
              className={`text-xs flex items-center gap-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              View all <FiExternalLink size={12} />
            </button>
          }>
          <div className="space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-wide ${textSub}`}>Filed by you</p>
            <StatusPill label="Pending"     value={filedPending}                      color="bg-yellow-400" isDark={isDark} />
            <StatusPill label="In Progress" value={myComplaints.filter(c=>c.status==="in_progress").length} color="bg-blue-400" isDark={isDark} />
            <StatusPill label="Resolved"    value={filedResolved}                     color="bg-green-400"  isDark={isDark} />
            <StatusPill label="Rejected"    value={myComplaints.filter(c=>c.status==="rejected").length}    color="bg-red-400"    isDark={isDark} />
            <div className={`border-t pt-3 mt-1 ${rowLine}`} />
            <p className={`text-xs font-semibold uppercase tracking-wide ${textSub}`}>Received against you</p>
            <StatusPill label="Pending"  value={receivedPending}   color="bg-yellow-400" isDark={isDark} />
            <StatusPill label="Resolved" value={receivedResolved}  color="bg-green-400"  isDark={isDark} />
            <StatusPill label="Others"   value={receivedComplaints.length - receivedPending - receivedResolved} color="bg-gray-400" isDark={isDark} />
          </div>
        </Section>
      </div>

      {/* ── Row 3: Assigned classes/courses table ── */}
      <Section title="Your Class & Course Assignments" isDark={isDark}
        action={
          <button onClick={() => navigate("/take-attendance")}
            className={`text-xs flex items-center gap-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            Take Attendance <FiExternalLink size={12} />
          </button>
        }>
        {loading ? (
          <p className={`text-sm ${textSub}`}>Loading…</p>
        ) : assignments.length === 0 ? (
          <p className={`text-sm ${textSub}`}>No assignments found for your account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${rowLine} ${textSub}`}>
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Class</th>
                  <th className="text-left py-2 pr-4">Course</th>
                  <th className="text-left py-2">Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={a.id} className={`border-b ${rowLine}`}>
                    <td className={`py-2.5 pr-4 ${textSub} text-xs`}>{i + 1}</td>
                    <td className={`py-2.5 pr-4 font-medium ${textPri}`}>
                      {a.class?.className ?? a.Class?.className ?? `Class #${a.classId}`}
                    </td>
                    <td className={`py-2.5 pr-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {a.course?.courseName ?? a.Course?.courseName ?? `Course #${a.courseId}`}
                    </td>
                    <td className={`py-2.5 text-xs ${textSub}`}>
                      {a.academicYear?.yearName ?? a.AcademicYear?.yearName ?? `Year #${a.academicYearId}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Quick actions ── */}
      <Section title="Quick Actions" isDark={isDark}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { icon: FiCalendar,   label: "Take Attendance", to: "/take-attendance",  color: "bg-cyan-500"    },
            { icon: FiClipboard,  label: "View Attendance", to: "/view-attendance",  color: "bg-blue-500"    },
            { icon: FiBarChart2,  label: "Fill Marks",      to: "/fill-marks",       color: "bg-indigo-500"  },
            { icon: FiTrendingUp, label: "View Marks",      to: "/view-marks",       color: "bg-violet-500"  },
            { icon: FiSend,       label: "My Complaints",   to: "/complaints",       color: "bg-orange-500"  },
            { icon: FiInbox,      label: "Received",        to: "/complaints",       color: "bg-red-500"     },
          ].map(({ icon, label, to, color }) => (
            <QuickLink key={label} icon={icon} label={label} to={to} accent={color} isDark={isDark} navigate={navigate} />
          ))}
        </div>
      </Section>

    </div>
  );
};

// ─── Root: branch by role ─────────────────────────────────────────────────────

const _HomePage = HomePage; // keep admin dashboard

const HomePageRoot = () => {
  const { hasRole } = useContext(AuthContext);
  if (hasRole("teacher")) return <TeacherDashboard />;
  return <_HomePage />;
};

export default HomePageRoot;
