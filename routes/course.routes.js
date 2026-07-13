const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validate } = require('../middleware/validation');
const { createCourseSchema, updateCourseSchema, enrollSchema } = require('../validations/course.validation');
const {auth, checkPermission} = require('../middleware/auth');

router.post('/',  courseController.createCourse);
router.use(auth);

// List courses
router.get('/', checkPermission("courses", "view"), courseController.getAllCourses);

// Create course
router.post('/', checkPermission("courses", "create"), validate(createCourseSchema), courseController.createCourse);

// Get course by id
router.get('/:id', checkPermission("courses", "read"), courseController.getCourseById);

// Update course
router.put('/:id', checkPermission("courses", "update"), validate(updateCourseSchema), courseController.updateCourse);

// Delete course
router.delete('/:id', checkPermission("courses", "delete"), courseController.deleteCourse);

// Enroll student to course
router.post('/:id/enroll', checkPermission("courses", "create"), validate(enrollSchema), courseController.enrollStudent);

module.exports = router;
