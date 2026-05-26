const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const blog = sequelize.define ('blog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    blogDetail : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date : {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    image : {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
}, {
    tableName: 'blogs',
    timestamps: true,
    charset: 'utf8', 
    collate: 'utf8_general_ci',
});

module.exports = blog;