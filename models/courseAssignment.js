const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CourseAssignment = sequelize.define(
  "courseAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "course_assignments",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  },
);

module.exports = CourseAssignment;