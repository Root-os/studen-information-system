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
  { label: "Home", icon: FiHome, path: "/" },
  {
    label: "Students",
    icon: FiUsers,
    children: [
      { label: "Add Student", icon: FiUser, path: "/register-student" },
      { label: "View Students", icon: FiUser, path: "/view-students" }
    ]
  },
  { label: "Courses", icon: FiBook, path: "/courses" },
  {
    label: "Attendance",
    icon: FiClipboard,
    children: [
      { label: "Take Attendance", icon: FiClipboard, path: "/take-attendance" },
      { label: "View Attendance", icon: FiClipboard, path: "/view-attendance" }
    ]
  },
  { label: "Enrolments", icon: FiFileText, path: "/enrolments" },

  { label: "Managment", icon: FiFileText, path: "/managements" },
    {
    label: "Departments",
    icon: FiClipboard,
    children: [
      { label: "Departments", icon: FiClipboard, path: "/departments" },
      { label: "Members", icon: FiClipboard, path: "/members" }
    ]
  },
    { label: "Letter", icon: FiFileText, path: "/letter" },
      { label: "Mark List", icon: FiFileText, path: "/marklist" },
  { label: "Complaints", icon: FiAlertCircle, path: "/complaints" },
  { label: "Flagged Students", icon: FiTrendingUp, path: "/flagged-students" },
  { label: "Permissions", icon: FiShield, path: "/permissions" },
  { label: "Punishments", icon: FiFileText, path: "/punishments" },
  { label: "Blog", icon: FiFileText, path: "/blog" },
];