const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');


router.post('/', rolePermissionController.createRolePermission);
router.get('/', rolePermissionController.getRolePermissions);
router.get('/:id', rolePermissionController.getRolePermissionById);
router.put('/:id', rolePermissionController.updateRolePermission);
router.delete('/:id', rolePermissionController.deleteRolePermission);

module.exports = router;