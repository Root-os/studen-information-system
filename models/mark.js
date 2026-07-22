const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MarkList = sequelize.define(
  "markList",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    courseAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "mark_lists",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = MarkList;