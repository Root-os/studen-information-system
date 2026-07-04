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
    children: [
      {
        label: "Add Student",
        icon: FiUser,
        path: "/register-student",
        permissionKey: "add student",
        action: "create",
      },
      {
        label: "View Students",
        icon: FiUser,
        path: "/view-students",
        permissionKey: "view students",
        action: "view"
      },
    ],
  },

  {
    label: "Courses",
    icon: FiBook,
    path: "/courses",
    permissionKey: "courses",
  },

  {
    label: "Attendance",
    icon: FiClipboard,
    children: [
      {
        label: "Take Attendance",
        icon: FiClipboard,
        path: "/take-attendance",
        permissionKey: "take attendance",
        action: "create"
      },
      {
        label: "View Attendance",
        icon: FiClipboard,
        path: "/view-attendance",
        permissionKey: "view attendance",
        action: "view"
      },
    ],
  },

  {
    label: "Enrolments",
    icon: FiFileText,
    path: "/enrolments",
    permissionKey: "enrolments",
  },

  {
    label: "Managment",
    icon: FiFileText,
    path: "/managements",
    permissionKey: "managment",
  },

  {
    label: "Departments",
    icon: FiClipboard,
    children: [
      {
        label: "Departments",
        icon: FiClipboard,
        path: "/departments",
        permissionKey: "departments",
      },
      {
        label: "Members",
        icon: FiClipboard,
        path: "/members",
        permissionKey: "members",
      },
    ],
  },

  {
    label: "Letter",
    icon: FiFileText,
    path: "/letter",
    permissionKey: "letter",
  },

  {
    label: "Mark List",
    icon: FiFileText,
    path: "/marklist",
    permissionKey: "mark list",
  },

  {
    label: "Complaints",
    icon: FiAlertCircle,
    path: "/complaints",
    permissionKey: "complaints",
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

  {
    label: "Blog",
    icon: FiFileText,
    path: "/blog",
    permissionKey: "blog",
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
];