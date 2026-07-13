const AcademicYear = require("../models/academicYear");

async function seedAcademicYear() {
  try {
    await AcademicYear.findOrCreate({
      where: {
        yearName: "2026",
      },
      defaults: {
        // startDate: "2026-09-01",
        // endDate: "2027-06-30",
        isCurrent: true,
      },
    });

    console.log("✅ Academic year seeded.");
  } catch (error) {
    console.error("❌ Error seeding academic year:", error);
  }
}

module.exports = seedAcademicYear;