const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const complain = sequelize.define ('complain', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    complainant: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    respondant: {
        type:DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    complaint: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
}, {
    tableName: 'complains',
    timestamps: true,
    charset: 'utf8', 
    collate: 'utf8_general_ci',
});

module.exports = complain;