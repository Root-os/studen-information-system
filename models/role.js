const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    },
    name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    },
    description: {
    type: DataTypes.STRING,
    allowNull: true,
    },
}, {
    tableName: 'roles',
    timestamps: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
});

module.exports = Role;