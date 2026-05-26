const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { validate } = require('../middleware/validation');
const { createAttendanceSchema, updateAttendanceSchema, idParam } = require('../validations/attendance.validation');

// List attendance
router.get('/', attendanceController.getAllAttendance);

// Create
router.post('/',  attendanceController.createAttendance);

// Read
router.get('/:id', validate(idParam), attendanceController.getAttendanceById);

// Update
router.put('/:id', validate(updateAttendanceSchema), attendanceController.updateAttendance);

// Delete
router.delete('/:id', validate(idParam), attendanceController.deleteAttendance);

// Summary for a student
router.get('/summary/by-student', attendanceController.getStudentAttendanceSummary);

module.exports = router;
