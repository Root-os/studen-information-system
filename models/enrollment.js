const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Enrollment = sequelize.define(
  "enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    academicYearId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "TRANSFERRED", "DROPPED", "COMPLETED"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
    indexes: [
      {
        unique: true,
        fields: ["studentId", "academicYearId"],
      },
    ],
  },
);

module.exports = Enrollment;
