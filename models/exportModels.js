const User = require('./user');
const Course = require('./courses');
const StudentCourse = require('./studentCourse');
// const MarkList = require('./marklist');
const Attendance = require('./attendance');
const Complain = require('./complain');
const Punishment = require('./punishment');
const Permission = require('./permission');
const Flag = require('./flag');
const Blog = require('./blog');
const sequelize = require('../config/database');
const Management = require('./management');
const Department = require('./departments');
const UserDepartment = require('./userDepartment');
const Letter = require('./letter');
const Role = require('./role');
const RolePermission = require('./rolePermission');
const AssignUser = require('./assignUser');
const Teacher = require('./teacher');
const StaffUser = require('./staffUser');


module.exports = {
  sequelize,
  User,
  Course,
  StudentCourse,
  // MarkList,
  Attendance,
  Complain,
  Punishment,
  Permission,
  Flag,
  Blog,
  Management,
  Department,
  UserDepartment,
  Letter,
  Role,
  RolePermission,
  AssignUser,
  Teacher,
  StaffUser
};
