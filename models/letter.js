const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Department = require('./departments');
const UserDepartment = require('./userDepartment');
const Management = require('./management');

const Letter = sequelize.define('Letter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  attachment: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('sent', 'read'), defaultValue: 'sent' },
  senderType: { 
    type: DataTypes.ENUM('User', 'Department', 'UserDepartment', 'Management'), 
    allowNull: false 
  },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  receiverType: { 
    type: DataTypes.ENUM('User', 'Department', 'UserDepartment', 'Management'), 
    allowNull: false 
  },
  receiverId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
});
module.exports = Letter;