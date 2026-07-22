const express = require("express");
const router = express.Router();

const controller = require("../controllers/courseAssignController");

router.post("/", controller.createCourseAssignment);

router.get("/", controller.getAllCourseAssignments);

router.get("/teacher/:teacherId", controller.getAssignmentsByTeacher);

router.get("/:id", controller.getCourseAssignmentById);

router.put("/:id", controller.updateCourseAssignment);

router.delete("/:id", controller.deleteCourseAssignment);

router.get("/class/:classId/teachers", controller.getTeachersByClass);

module.exports = router;