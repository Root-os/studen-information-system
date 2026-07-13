const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./user.routes");
const courseRoutes = require("./course.routes");
const attendanceRoutes = require("./attendance.routes");
const marklistRoutes = require("./marklist.routes");
const complainRoutes = require("./complain.routes");
const blogRoutes = require("./blog.routes");
const studentCourseRoutes = require("./studentCourse.routes");
const punishmentRoutes = require("./punishment.routes");
const permissionRoutes = require("./permission.routes");
const flagRoutes = require("./flag.routes");
const authRoutes = require("./authRoutes");
const managemnetRoutes = require("./managemntRoutes");
const departmentRoutes = require("./departmentRoutes");
const userDepartmentRoutes = require("./userDepartment.routes");
const letterRoutes = require("./letterRoutes");
const roleRoutes = require("./roleRoute");
const rolePermissionRoutes = require("./rolePermissionRoutes");
const assignUserRoutes = require("./assignUserRoutes");
const staffRoutes = require("./staffRoute");
const teacherRoutes = require("./teacherRoutes");
const academicYear = require("./academicYearRoutes");
const classRoutes = require("./classRoutes");
const enrollmentRoutes = require("./enrollmentRoutes");
const courseAssignRoutes = require("./courseAssignRoutes");
const atendanceRoutes = require("./atendanceRoutes")

// Auth routes
router.use("/auth", authRoutes);

// API Routes
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/attendance", atendanceRoutes);
router.use("/marks", marklistRoutes);
router.use("/complaints", complainRoutes);
router.use("/blogs", blogRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/punishments", punishmentRoutes);
router.use("/permissions", permissionRoutes);
router.use("/flags", flagRoutes);
router.use("/managemnt", managemnetRoutes);
router.use("/department", departmentRoutes);
router.use("/user-department", userDepartmentRoutes);
router.use("/letter", letterRoutes);
router.use("/role", require("./roleRoute"));
router.use("/role-permission", rolePermissionRoutes);
router.use("/assign-user", assignUserRoutes);
router.use("/staff", staffRoutes);
router.use("/teacher", teacherRoutes);
router.use("/academicYear", academicYear);
router.use("/class", classRoutes);
router.use("/enrollment", enrollmentRoutes);
router.use("/courseAssign", courseAssignRoutes);
router.use("/attend", attendanceRoutes);

module.exports = router;
