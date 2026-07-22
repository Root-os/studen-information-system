const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");

const Teacher = sequelize.define("Teacher", {
 id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 fullName: {
    type: DataTypes.STRING,
    allowNull: false,
 },
 phone:{
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
 roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },

},
{
   tableName: "teachers",
   timestamps: true,
   charset: "utf8",
   collate: "utf8_general_ci",
}

);

module.exports = Teacher;