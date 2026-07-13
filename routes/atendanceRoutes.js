const express = require("express");

const router = express.Router();

const controller = require("../controllers/atendanceController");

router.post("/", controller.createAttendance);

router.get("/", controller.getAllAttendance);

router.get("/:id", controller.getAttendanceById);

router.delete("/:id", controller.deleteAttendance);

module.exports = router;