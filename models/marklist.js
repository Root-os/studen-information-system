const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const markList = sequelize.define ('markList', {
    
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        reference: {
            model: 'courses',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    studentId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        reference: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    teacherId: {
       type: DataTypes.INTEGER,
       allowNull: false,
       reference: {
           model: 'users',
           key: 'id',
       },
       onDelete: 'CASCADE',
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'markList',
    timestamps: true,
    charset: 'utf8', 
    collate: 'utf8_general_ci',
});

module.exports = markList;