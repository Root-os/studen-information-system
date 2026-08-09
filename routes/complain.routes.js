const express = require('express');
const router = express.Router();
const c = require('../controllers/complain.controller');
const { validate } = require('../middleware/validation');
const {
  createComplaintSchema,
  updateComplaintSchema,
  updateComplaintStatusSchema,
  idParam,
} = require('../validations/complain.validation');

// ── Stats & lookup (before /:id so they don't get swallowed) ──────────────────
router.get('/stats/summary',       c.getComplaintStats);
router.get('/lookup/respondants',  c.lookupRespondants);

// ── Track by party ID ─────────────────────────────────────────────────────────
// ?type=student|teacher
router.get('/track/complainant/:id', c.trackByComplainant);
router.get('/track/respondant/:id',  c.trackByRespondant);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get('/',   c.getAllComplaints);
router.post('/',  validate(createComplaintSchema), c.createComplaint);

router.get('/:id',          validate(idParam), c.getComplaintById);
router.put('/:id',          validate(updateComplaintSchema), c.updateComplaint);
router.patch('/:id/status', validate(updateComplaintStatusSchema), c.updateComplaintStatus);
router.delete('/:id',       validate(idParam), c.deleteComplaint);

module.exports = router;
