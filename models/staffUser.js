const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");

const StaffUser = sequelize.define("StaffUser", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    responsibility:{
        type: DataTypes.STRING,
        allowNull: true,
    }
},
{
    tableName: "staff-users",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
}
);

module.exports = StaffUser;