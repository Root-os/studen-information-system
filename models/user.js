const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    baptismaName: { type: DataTypes.STRING, allowNull: true },
    hollyFatherName: { type: DataTypes.STRING, allowNull: true },
    hollyFatherPhone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    SubCity: { type: DataTypes.STRING, allowNull: true },
    woreda: { type: DataTypes.STRING, allowNull: true },
    homeNumber: { type: DataTypes.STRING, allowNull: true },
    educationLevel: { type: DataTypes.STRING, allowNull: true },
    //family Information
    famillyFullName: { type: DataTypes.STRING, allowNull: true },
    Relationship: { type: DataTypes.STRING, allowNull: true },
    familyAddress: { type: DataTypes.STRING, allowNull: true },
    familyWoreda: { type: DataTypes.STRING, allowNull: true },
    familySubCity: { type: DataTypes.STRING, allowNull: true },
    familyHomeNumber: { type: DataTypes.STRING, allowNull: true },
    familyPhone: { type: DataTypes.STRING, allowNull: true },
    registeredDate: { type: DataTypes.DATEONLY, allowNull: true },
    class: { type: DataTypes.STRING, allowNull: true },
    approvedBy: { type: DataTypes.STRING, allowNull: true },
    approvedDate: { type: DataTypes.DATEONLY, allowNull: true },
    studentPhoto: { type: DataTypes.STRING, allowNull: true },
    familyPhoto: { type: DataTypes.STRING, allowNull: true },
    otherDocument: { type: DataTypes.STRING, allowNull: true },
    category: {
      type: DataTypes.ENUM("student", "regullar", "unique_regular", "honorary_members"),
      defaultValue: "student",
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "STUDENT", "TEACHER"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    charset: "utf8",
    collate: "utf8_general_ci",
  },
);

module.exports = User;
