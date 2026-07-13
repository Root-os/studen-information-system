const seedRoles = require("./roleSeeder");
const seedClasses = require("./classSeeder");
const seedAcademicYear = require("./yearSeeder");

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  await seedRoles();
  await seedClasses();
  await seedAcademicYear();

  console.log("✅ Database seeding completed.");
}

module.exports = seedDatabase;