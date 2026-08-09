const Role = require("../models/role");

async function seedRoles() {
  try {
    const roles = [
      {
        name: "TEACHER",
        description: "Teacher",
      },
      {
        name: "STUDENT",
        description: "Student",
      },

            {
        name: "SUPER ADMIN",
        description: "Super Admin",
      },
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: {
          name: role.name,
        },
        defaults: role,
      });
    }

    console.log("✅ Roles seeded.");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
  }
}

module.exports = seedRoles;