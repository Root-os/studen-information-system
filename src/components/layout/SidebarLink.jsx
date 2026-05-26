import { 
  FiHome, 
  FiUser, 
  FiSettings, 
  FiUsers, 
  FiBook, 
  FiClipboard, 
  FiFileText, 
  FiAlertCircle, 
  FiShield, 
  FiTrendingUp 
} from "react-icons/fi";

export const menuItems = [
  { label: "Home", icon: FiHome, path: "/",  roles: ["ADMIN", "TEACHER", "STUDENT"]},
  {
    label: "Students",
    icon: FiUsers,
    children: [
      { label: "Add Student", icon: FiUser, path: "/register-student", roles: ["ADMIN"] },
      { label: "View Students", icon: FiUser, path: "/view-students", roles: ["ADMIN"] }
    ]
  },
  { label: "Courses", icon: FiBook, path: "/courses", roles: ["ADMIN", "TEACHER"] },
  {
    label: "Attendance",
    icon: FiClipboard,
    children: [
      { label: "Take Attendance", icon: FiClipboard, path: "/take-attendance", roles: ["ADMIN", "TEACHER"] },
      { label: "View Attendance", icon: FiClipboard, path: "/view-attendance", roles: ["ADMIN", "TEACHER", "STUDENT"] }
    ]
  },
  { label: "Enrolments", icon: FiFileText, path: "/enrolments", roles: ["ADMIN", "TEACHER"] },

  { label: "Managment", icon: FiFileText, path: "/managements", roles: ["ADMIN"] },
    {
    label: "Departments",
    icon: FiClipboard,
    children: [
      { label: "Departments", icon: FiClipboard, path: "/departments", roles: ["ADMIN"] },
      { label: "Members", icon: FiClipboard, path: "/members", roles: ["ADMIN"] }
    ]
  },
    { label: "Letter", icon: FiFileText, path: "/letter", roles: ["ADMIN"] },
      { label: "Mark List", icon: FiFileText, path: "/marklist", roles: ["ADMIN", "TEACHER"] },
  { label: "Complaints", icon: FiAlertCircle, path: "/complaints", roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { label: "Flagged Students", icon: FiTrendingUp, path: "/flagged-students", roles: ["ADMIN"] },
  { label: "Permissions", icon: FiShield, path: "/permissions", roles: ["ADMIN"] },
  { label: "Punishments", icon: FiFileText, path: "/punishments", roles: ["ADMIN"] },
  { label: "Blog", icon: FiFileText, path: "/blog", roles: ["ADMIN"] },
];