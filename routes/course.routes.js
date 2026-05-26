const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validate } = require('../middleware/validation');
const { createCourseSchema, updateCourseSchema, enrollSchema } = require('../validations/course.validation');

// List courses
router.get('/', courseController.getAllCourses);

// Create course
router.post('/', validate(createCourseSchema), courseController.createCourse);

// Get course by id
router.get('/:id', courseController.getCourseById);

// Update course
router.put('/:id', validate(updateCourseSchema), courseController.updateCourse);

// Delete course
router.delete('/:id', courseController.deleteCourse);

// Enroll student to course
router.post('/:id/enroll', validate(enrollSchema), courseController.enrollStudent);

module.exports = router;
