const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/flag.controller');
const { validate } = require('../middleware/validation');
const { createFlagSchema, updateFlagSchema, idParam } = require('../validations/flag.validation');

// List
router.get('/', ctrl.getAllFlags);

// Create
router.post('/', validate(createFlagSchema), ctrl.createFlag);

// Read
router.get('/:id', validate(idParam), ctrl.getFlagById);

// Update
router.put('/:id', validate(updateFlagSchema), ctrl.updateFlag);

// Deactivate
router.patch('/:id/deactivate', ctrl.deactivateFlag);

// Delete
router.delete('/:id', validate(idParam), ctrl.deleteFlag);

module.exports = router;
