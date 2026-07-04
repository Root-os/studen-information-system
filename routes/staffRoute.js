const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

router.post("/", staffController.createStaffUser);
router.post("/login", staffController.staffLogin);
router.get("/", staffController.getStaffUsers);
router.get("/:id", staffController.getStaffUserById);
router.put("/:id", staffController.updateStaffUser);
router.delete("/:id", staffController.deleteStaffUser);

module.exports = router;