const express = require("express");
const router = express.Router();

const assignUserController = require("../controllers/assigneUserController");

router.post("/", assignUserController.createAssignUser);

router.get("/", assignUserController.getAllAssignUsers);

router.get("/:id", assignUserController.getAssignUserById);

router.put("/:id", assignUserController.updateAssignUser);

router.delete("/:id", assignUserController.deleteAssignUser);

module.exports = router;