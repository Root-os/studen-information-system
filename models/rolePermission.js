const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: 'role-permissions',
    timestamps: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  }
);

module.exports = RolePermission;