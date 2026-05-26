const express = require("express");
const router = express.Router();
const managementController = require("../controllers/managementController");

// CRUD routes
router.post("/", managementController.createManagement); // Create a role
router.get("/", managementController.getAllManagement); // Get all roles
router.get("/user/:userId", managementController.getByUserId); // Get roles by userId
router.put("/:id", managementController.updateManagement); // Update role by id
router.delete("/:id", managementController.deleteManagement); // Delete role by id

module.exports = router;