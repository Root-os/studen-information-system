const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complain = sequelize.define('complain', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Who filed — User.id for student, Teacher.id for teacher
  complainant: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  complainantType: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
  },

  // Who is complained about
  respondant: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  respondantType: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
  },

  // The class that links both parties
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },

  // The academic year in which the incident occurred
  academicYearId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'academic_years', key: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },

  // Derived: teacher_to_student | student_to_teacher | student_to_student
  category: {
    type: DataTypes.ENUM('teacher_to_student', 'student_to_teacher', 'student_to_student'),
    allowNull: false,
  },

  complaint: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },

  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'complains',
  timestamps: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
});

module.exports = Complain;
