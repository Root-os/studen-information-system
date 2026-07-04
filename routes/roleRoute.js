const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleControler');

// Create Role
router.post('/', roleController.createRole);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;