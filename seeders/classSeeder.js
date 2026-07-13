const Class = require("../models/class");

async function seedClasses() {
  try {
    const count = await Class.count();

    if (count > 0) {
      console.log("✅ Classes already exist. Skipping...");
      return;
    }

    await Class.bulkCreate([
      {
        className: "Grade 1",
        description: "Grade 1",
        isActive: true,
      },
      {
        className: "Grade 2",
        description: "Grade 2",
        isActive: true,
      },
      {
        className: "Grade 3",
        description: "Grade 3",
        isActive: true,
      },
      {
        className: "Grade 4",
        description: "Grade 4",
        isActive: true,
      },
      {
        className: "Grade 5",
        description: "Grade 5",
        isActive: true,
      },
      {
        className: "Grade 6",
        description: "Grade 6",
        isActive: true,
      },
      {
        className: "Grade 7",
        description: "Grade 7",
        isActive: true,
      },
      {
        className: "Grade 8",
        description: "Grade 8",
        isActive: true,
      },
      {
        className: "Grade 9",
        description: "Grade 9",
        isActive: true,
      },
      {
        className: "Grade 10",
        description: "Grade 10",
        isActive: true,
      },
      {
        className: "Grade 11",
        description: "Grade 11",
        isActive: true,
      },
      {
        className: "Grade 12",
        description: "Grade 12",
        isActive: true,
      },
      {
        className: "Mezmur Class",
        description: "Holy Song (Mezmur) Class",
        isActive: true,
      },
    ]);

    console.log("✅ Classes seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding classes:", error);
  }
}

module.exports = seedClasses;