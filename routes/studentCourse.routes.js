const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentCourse.controller');
const { validate } = require('../middleware/validation');
const { createEnrollmentSchema, idParam, byStudentParam, byCourseParam } = require('../validations/studentCourse.validation');

// List
router.get('/', ctrl.getAllEnrollments);

// Create enrollment
router.post('/', validate(createEnrollmentSchema), ctrl.createEnrollment);

// Read
router.get('/:id', validate(idParam), ctrl.getEnrollmentById);

// Delete enrollment
router.delete('/:id', validate(idParam), ctrl.deleteEnrollment);

// Get all courses for student
router.get('/by-student/:studentId', validate(byStudentParam), ctrl.getCoursesForStudent);

// Get all students for course
router.get('/by-course/:courseId', validate(byCourseParam), ctrl.getStudentsForCourse);

module.exports = router;
