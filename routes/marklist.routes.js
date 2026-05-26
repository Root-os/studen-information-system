const express = require('express');
const router = express.Router();
const marklistController = require('../controllers/marklist.controller');
const { validate } = require('../middleware/validation');
const { upsertMarksSchema, idParam } = require('../validations/marklist.validation');

// List marks
router.get('/', marklistController.getAllMarks);

// Create or update (upsert) marks
router.post('/', validate(upsertMarksSchema), marklistController.upsertMarks);

// Read
router.get('/:id', validate(idParam), marklistController.getMarksById);
router.put('/:id', marklistController.updateMark);

// Delete
router.delete('/:id', validate(idParam), marklistController.deleteMarks);

// Grade report for a student
router.get('/report/:studentId', marklistController.getStudentGradeReport);

module.exports = router;
