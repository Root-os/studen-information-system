const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require("./user");
const Department = require("./departments")

const UserDepartment = sequelize.define("UserDepartment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
  departmentId: { type: DataTypes.INTEGER, references: { model: Department, key: "id" } },
  role: { type: DataTypes.STRING, allowNull: false }, 
},
{
    timestamps: true,
    charset: 'utf8', 
    collate: 'utf8_general_ci',
}
);

module.exports = UserDepartment;