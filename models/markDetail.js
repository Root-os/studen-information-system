const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MarkDetail = sequelize.define(
  "markDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    markListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    mark: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "mark_details",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = MarkDetail;