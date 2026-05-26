const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/permission.controller');
const { validate } = require('../middleware/validation');
const { createPermissionSchema, updatePermissionSchema, idParam } = require('../validations/permission.validation');

// List
router.get('/', ctrl.getAllPermissions);

// Create
router.post('/', validate(createPermissionSchema), ctrl.createPermission);

// Read
router.get('/:id', validate(idParam), ctrl.getPermissionById);

// Update (pending only)
router.put('/:id', validate(updatePermissionSchema), ctrl.updatePermission);

// Approve
router.patch('/:id/approve', ctrl.approvePermission);

// Reject
router.patch('/:id/reject', ctrl.rejectPermission);

// Delete
router.delete('/:id', validate(idParam), ctrl.deletePermission);

module.exports = router;
