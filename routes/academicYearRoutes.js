const express = require("express");
const router = express.Router();
const academicYearController = require("../controllers/academicYearController");

router.post("/", academicYearController.createAcademicYear);

router.get("/", academicYearController.getAllAcademicYears);

router.get("/current", academicYearController.getCurrentAcademicYear);

router.get("/:id", academicYearController.getAcademicYearById);

router.put("/:id", academicYearController.updateAcademicYear);

router.patch(
  "/current/:id",
  academicYearController.setCurrentAcademicYear
);

router.delete("/:id", academicYearController.deleteAcademicYear);

module.exports = router;