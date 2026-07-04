const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignUser = sequelize.define(
  'AssignUser',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    staffUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'assign_users',
    timestamps: true,
  }
);

module.exports = AssignUser;