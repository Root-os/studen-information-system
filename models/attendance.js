const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const attendance = sequelize.define('attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        reference: {
            model: 'course',
            key: 'id'
        }
    },
    studentId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    teacherId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    attendance: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT'),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
},
{
    tableName: 'attendance',
    timestamps: true,
    charset: 'utf8', 
    collate: 'utf8_general_ci',
}
);

module.exports = attendance;