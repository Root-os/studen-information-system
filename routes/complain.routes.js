const express = require('express');
const router = express.Router();
const complainController = require('../controllers/complain.controller');
const { validate } = require('../middleware/validation');
const { createComplaintSchema, updateComplaintSchema, updateComplaintStatusSchema, idParam } = require('../validations/complain.validation');

// List complaints
router.get('/', complainController.getAllComplaints);

// My complaints
router.get('/me', complainController.getMyComplaints);

// Stats
router.get('/stats/summary', complainController.getComplaintStats);

// Create
router.post('/', validate(createComplaintSchema), complainController.createComplaint);

// Read
router.get('/:id', validate(idParam), complainController.getComplaintById);

// Update
router.put('/:id', validate(updateComplaintSchema), complainController.updateComplaint);

// Update status
router.patch('/:id/status', validate(updateComplaintStatusSchema), complainController.updateComplaintStatus);

// Delete
router.delete('/:id', validate(idParam), complainController.deleteComplaint);

module.exports = router;
