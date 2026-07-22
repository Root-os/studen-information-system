const express = require("express");
const router = express.Router();

const markController = require("../controllers/marklist.controller");
const { auth, authorize, checkPermission } = require("../middleware/auth");
router.use(auth);
// Create mark list with student marks
router.post("/", markController.createMarkList);
router.get("/", markController.getAllMarkLists);
router.get("/:id", markController.getMarkListById);
router.put("/detail/:id", markController.updateMark);
router.put("/:id", markController.updateMarkList);
router.delete("/detail/:id", markController.deleteMark);
router.delete("/:id", markController.deleteMarkList);
router.get("/student/:studentId", markController.getMarksByStudent);

module.exports = router;
