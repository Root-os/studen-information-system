const express = require("express");
const router = express.Router();
const letterController = require("../controllers/letter.controller");
const upload = require("../middleware/uploadLetter"); 

// Create a new letter (supports optional attachment)
router.post("/send", upload.single("attachment"), letterController.create);

// Get all letters
router.get("/", letterController.getAll);

// Get a single letter by ID
router.get("/:id", letterController.getById);

// Update a letter (optionally update attachment)
router.put("/:id", upload.single("attachment"), letterController.update);

// Delete a letter
router.delete("/:id", letterController.delete);

module.exports = router;