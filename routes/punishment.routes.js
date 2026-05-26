const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/punishment.controller');
const { validate } = require('../middleware/validation');
const { createPunishmentSchema, updatePunishmentSchema, idParam } = require('../validations/punishment.validation');

// List
router.get('/', ctrl.getAllPunishments);

// Create
router.post('/', validate(createPunishmentSchema), ctrl.createPunishment);

// Read
router.get('/:id', validate(idParam), ctrl.getPunishmentById);

// Update
router.put('/:id', validate(updatePunishmentSchema), ctrl.updatePunishment);

// Delete
router.delete('/:id', validate(idParam), ctrl.deletePunishment);

module.exports = router;
