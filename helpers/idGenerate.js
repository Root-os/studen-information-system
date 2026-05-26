// helpers/idGenerate.js
const { Op } = require("sequelize");
const User = require("../models/user");

const generateStudentId = async () => {
  const lastStudent = await User.findOne({
    where: { studentId: { [Op.ne]: null } },
    order: [["studentId", "DESC"]],
  });

  let newNumber = 1;

  if (lastStudent && lastStudent.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.split("-")[1], 10);
    newNumber = lastNumber + 1;
  }

  return `STU-${String(newNumber).padStart(4, "0")}`;
};

module.exports = generateStudentId; 