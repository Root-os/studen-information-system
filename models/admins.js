const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const admins = sequelize.define('admins', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('ADMIN'),
        allowNull: false,
    }

});

module.exports = admins;