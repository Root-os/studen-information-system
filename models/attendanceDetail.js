const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AttendanceDetail = sequelize.define(
  "attendanceDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attendanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED",
        "BY_PERMISSION",
      ),
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "attendance_details",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  },
);

module.exports = AttendanceDetail;