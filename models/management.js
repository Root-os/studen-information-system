const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Management = sequelize.define(
  "Management",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    assignedRole: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "management",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);
module.exports = Management;