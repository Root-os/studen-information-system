import {
  FiHome,
  FiUser,
  FiUsers,
  FiBook,
  FiClipboard,
  FiFileText,
  FiAlertCircle,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";

export const menuItems = [
  {
    label: "Home",
    icon: FiHome,
    path: "/",
    permissionKey: "home",
  },

  {
    label: "Students",
    icon: FiUsers,
    permissionKey: "students",
    children: [
      {
        label: "Add Student",
        icon: FiUser,
        path: "/register-student",
        action: "create",
      },
      {
        label: "View Students",
        icon: FiUser,
        path: "/view-students",
        action: "view",
      },
    ],
  },

  {
    label: "Teacher",
    icon: FiFileText,
    path: "/teachers",
    permissionKey: "teachers",
  },

  {
    label: "Enrolments",
    icon: FiFileText,
    path: "/enrolments",
    permissionKey: "enrolments",
  },

  {
    label: "Courses",
    icon: FiBook,
    path: "/courses",
    permissionKey: "courses",
  },

  {
    label: "Class",
    icon: FiBook,
    path: "/classes",
    permissionKey: "classes",
  },

  {
    label: "Course Assign",
    icon: FiFileText,
    path: "/courseAssignment",
    permissionKey: "course-assignments",
  },

  {
    label: "Attendance",
    icon: FiClipboard,
    permissionKey: "attendance",
    allowedRoles: ["Teacher"],
    children: [
      {
        label: "Take Attendance",
        icon: FiClipboard,
        path: "/take-attendance",
        action: "create",
      },
      {
        label: "View Attendance",
        icon: FiClipboard,
        path: "/view-attendance",
        action: "view",
      },
    ],
  },

  {
    label: "Mark List",
    icon: FiClipboard,
    permissionKey: "marklist",
    allowedRoles: ["Teacher"],
    children: [
      {
        label: "Fill Mark",
        icon: FiClipboard,
        path: "/fill-marks",
        action: "create",
      },
      {
        label: "Mark Lists",
        icon: FiClipboard,
        path: "/view-marks",
        action: "view",
      },
    ],
  },

  // One Complaints entry for everyone:
  // - Teacher / Student: always visible (allowedRoles bypass), see scoped view
  // - Admin / other roles: need the "complaints" permission, see full admin view
  {
    label: "Complaints",
    icon: FiAlertCircle,
    path: "/complaints",
    permissionKey: "complaints",
    allowedRoles: ["Teacher", "Student"],
  },

  {
    label: "Roles",
    icon: FiFileText,
    path: "/roles",
    permissionKey: "roles",
  },

  {
    label: "Staff",
    icon: FiFileText,
    path: "/staffs",
    permissionKey: "staff",
  },

  {
    label: "Departments",
    icon: FiClipboard,
    path: "/departments",
    permissionKey: "departments",
  },

  {
    label: "Role Permission",
    icon: FiFileText,
    path: "/rolepermissions",
    permissionKey: "role permission",
  },

  {
    label: "Assign User",
    icon: FiFileText,
    path: "/assignusers",
    permissionKey: "assign user",
  },

  {
    label: "Letter",
    icon: FiFileText,
    path: "/letter",
    permissionKey: "letter",
  },

  {
    label: "Blog",
    icon: FiFileText,
    path: "/blog",
    permissionKey: "blog",
  },

  {
    label: "Flagged Students",
    icon: FiTrendingUp,
    path: "/flagged-students",
    permissionKey: "flagged students",
  },

  {
    label: "Permissions",
    icon: FiShield,
    path: "/permissions",
    permissionKey: "permissions",
  },

  {
    label: "Punishments",
    icon: FiFileText,
    path: "/punishments",
    permissionKey: "punishments",
  },
];
