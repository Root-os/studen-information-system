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
const authRoutes = require("./auth.routes");
const managemnetRoutes = require("./managemntRoutes");
const departmentRoutes = require("./departmentRoutes");
const userDepartmentRoutes = require("./userDepartment.routes");
const letterRoutes = require("./letterRoutes");

// Auth routes
router.use("/auth", authRoutes);

// API Routes
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/marks", marklistRoutes);
router.use("/complaints", complainRoutes);
router.use("/blogs", blogRoutes);
router.use("/enrollments", studentCourseRoutes);
router.use("/punishments", punishmentRoutes);
router.use("/permissions", permissionRoutes);
router.use("/flags", flagRoutes);
router.use("/managemnt", managemnetRoutes);
router.use("/department", departmentRoutes);
router.use("/user-department", userDepartmentRoutes);
router.use("/letter", letterRoutes);

module.exports = router;
