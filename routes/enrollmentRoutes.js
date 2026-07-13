const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");

router.post("/", enrollmentController.createEnrollment);

router.get("/", enrollmentController.getAllEnrollments);

router.get("/:id", enrollmentController.getEnrollmentById);

router.put("/:id", enrollmentController.updateEnrollment);

router.delete("/:id", enrollmentController.deleteEnrollment);
router.get("/class/:classId", enrollmentController.getStudentsByClass);

module.exports = router;