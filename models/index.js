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
const CourseAssignment = require('./courseAssignment');
const Enrollment = require('./enrollment');
const AcademicYear = require('./academicYear');
const Class = require('./class');
const AttendanceDetail = require('./attendanceDetail');
const MarkList = require('./mark');
const MarkDetail = require('./markDetail');

  // User Associations
  User.hasMany(StudentCourse, {
    foreignKey: 'studentId',
    as: 'studentCourses',
  });

  User.belongsToMany(Course, {
    through: StudentCourse,
    foreignKey: 'studentId',
    otherKey: 'courseId',
    as: 'courses',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Course Associations
  Course.belongsToMany(User, {
    through: StudentCourse,
    foreignKey: 'courseId',
    otherKey: 'studentId',
    as: 'students',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Course.hasMany(StudentCourse, {
    foreignKey: 'courseId',
    as: 'courseStudents',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Course.hasMany(MarkList, {
  //   foreignKey: 'courseId',
  //   as: 'marks',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE'
  // });

  // MarkList Associations
  // MarkList.belongsTo(User, {
  //   foreignKey: 'studentId',
  //   as: 'student',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE'
  // });

  // MarkList.belongsTo(User, {
  //   foreignKey: 'teacherId',
  //   as: 'teacher',
  //   onDelete: 'SET NULL',
  //   onUpdate: 'CASCADE'
  // });

  // MarkList.belongsTo(Course, {
  //   foreignKey: 'courseId',
  //   as: 'course',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE'
  // });

  // Attendance Associations
  Attendance.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Attendance.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // User's hasMany relationships
  // User.hasMany(MarkList, {
  //   foreignKey: 'studentId',
  //   as: 'marks',
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE'
  // });

  User.hasMany(Attendance, {
    foreignKey: 'studentId',
    as: 'attendances',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Complain Associations
  Complain.belongsTo(User, {
    foreignKey: 'complainant',
    as: 'complainantUser',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Complain.belongsTo(User, {
    foreignKey: 'respondant',
    as: 'respondentUser',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Complain, {
    foreignKey: 'complainant',
    as: 'filedComplaints',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Complain, {
    foreignKey: 'respondant',
    as: 'respondedComplaints',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Punishment Associations
  Punishment.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Punishment, {
    foreignKey: 'studentId',
    as: 'punishments',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Punishment issuer association
  Punishment.belongsTo(User, {
    foreignKey: 'issuedBy',
    as: 'issuer',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Punishment, {
    foreignKey: 'issuedBy',
    as: 'issuedPunishments',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Permission Associations
  Permission.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Permission, {
    foreignKey: 'userId',
    as: 'permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Permission.belongsTo(User, {
    foreignKey: 'approvedBy',
    as: 'approver',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Permission, {
    foreignKey: 'approvedBy',
    as: 'approvedPermissions',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Flag Associations
  Flag.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Flag, {
    foreignKey: 'userId',
    as: 'flags',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Flag.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  User.hasMany(Flag, {
    foreignKey: 'createdBy',
    as: 'createdFlags',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Fix for StudentCourse include
StudentCourse.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
StudentCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course.hasMany(Attendance, {
//   foreignKey: "courseId",
//   as: "attendances",
//   onDelete: "CASCADE",
//   onUpdate: "CASCADE"
// });
// Attendance.belongsTo(Course, {
//   foreignKey: "courseId",
//   as: "course",
//   onDelete: "CASCADE",
//   onUpdate: "CASCADE"
// });

// user <> management
Management.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Management, { foreignKey: "userId" });

//userDepartment <> User
UserDepartment.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserDepartment, { foreignKey: "userId" });

// department <> userDepartment
UserDepartment.belongsTo(Department, { foreignKey: "departmentId" });
Department.hasMany(UserDepartment, { foreignKey: "departmentId" });

// ==========================
// Letter sender associations
// ==========================

// Sender as User
Letter.belongsTo(User, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'senderUser'
});

// Sender as Department
Letter.belongsTo(Department, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'senderDepartment'
});

// Sender as UserDepartment
Letter.belongsTo(UserDepartment, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'senderUserDept'
});

// Sender as Management
Letter.belongsTo(Management, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'senderManagement'
});

// ============================
// Letter receiver associations
// ============================

// Receiver as User
Letter.belongsTo(User, {
  foreignKey: 'receiverId',
  constraints: false,
  as: 'receiverUser'
});

// Receiver as Department
Letter.belongsTo(Department, {
  foreignKey: 'receiverId',
  constraints: false,
  as: 'receiverDepartment'
});

// Receiver as UserDepartment
Letter.belongsTo(UserDepartment, {
  foreignKey: 'receiverId',
  constraints: false,
  as: 'receiverUserDept'
});

// Receiver as Management
Letter.belongsTo(Management, {
  foreignKey: 'receiverId',
  constraints: false,
  as: 'receiverManagement'
});

//========================================
RolePermission.belongsTo(Role, {
  foreignKey: 'roleId',
  constraints: false,
  as: 'role',
});

RolePermission.belongsTo(Department, {
  foreignKey: 'departmentId',
  constraints: false,
  as: 'department',
});

Role.hasMany(RolePermission, {
  foreignKey: 'roleId',
  constraints: false,
  as: 'rolePermissions',
});

Department.hasMany(RolePermission, {
  foreignKey: 'departmentId',
  constraints: false,
  as: 'rolePermissions',
});

AssignUser.belongsTo(Teacher, {
  foreignKey: 'teacherId',
  constraints: false,
  // as: 'teacher',
});

AssignUser.belongsTo(Department, {
  foreignKey: 'departmentId',
  constraints: false,
  // as: 'department',
});
AssignUser.belongsTo(StaffUser, {
  foreignKey: 'staffUserId',
  constraints: false,
  // as: 'staffUser',
});

AssignUser.belongsTo(Role, {
  foreignKey: 'roleId',
  constraints: false,
  // as: 'role',
});

Teacher.hasMany(AssignUser, {
  foreignKey: 'teacherId',
  constraints: false,
  // as: 'assignedDepartments',
});

Department.hasMany(AssignUser, {
  foreignKey: 'departmentId',
  constraints: false,
  // as: 'assignedUsers',
});

Role.hasMany(AssignUser, {
  foreignKey: 'roleId',
  constraints: false,
  // as: 'assignedUsers',
});

StaffUser.hasMany(AssignUser, {
  foreignKey: 'staffUserId',
  constraints: false,
  // as: 'assignedDepartments',
});

User.belongsTo(Role, {
  foreignKey: "roleId",
  // as: "role",
});

Role.hasMany(User, {
  foreignKey: "roleId",
  // as: "users",
});

Teacher.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(Teacher, {
  foreignKey: "roleId",
  as: "teachers",
});
//===========================================================================================================
// Student -> Enrollment
User.hasMany(Enrollment, {
  foreignKey: "studentId",
  // as: "enrollments",
});

Enrollment.belongsTo(User, {
  foreignKey: "studentId",
  // as: "student",
});

// Class -> Enrollment
Class.hasMany(Enrollment, {
  foreignKey: "classId",
  // as: "enrollments",
});

Enrollment.belongsTo(Class, {
  foreignKey: "classId",
  // as: "class",
});

// AcademicYear -> Enrollment
AcademicYear.hasMany(Enrollment, {
  foreignKey: "academicYearId",
  // as: "enrollments",
});

Enrollment.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  // as: "academicYear",
});

Course.hasMany(CourseAssignment, {
  foreignKey: "courseId",
  // as: "assignments",
});

CourseAssignment.belongsTo(Course, {
  foreignKey: "courseId",
  // as: "course",
});

Teacher.hasMany(CourseAssignment, {
  foreignKey: "teacherId",
  as: "courseAssignments",
});

CourseAssignment.belongsTo(Teacher, {
  foreignKey: "teacherId",
  as: "teacher",
});

Class.hasMany(CourseAssignment, {
  foreignKey: "classId",
  // as: "courseAssignments",
});

CourseAssignment.belongsTo(Class, {
  foreignKey: "classId",
  // as: "class",
});

AcademicYear.hasMany(CourseAssignment, {
  foreignKey: "academicYearId",
  // as: "courseAssignments",
});

CourseAssignment.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  // as: "academicYear",
});

CourseAssignment.hasMany(Attendance, {
  foreignKey: "courseAssignmentId",
  // as: "attendances",
});

Attendance.belongsTo(CourseAssignment, {
  foreignKey: "courseAssignmentId",
  // as: "courseAssignment",
});

Attendance.hasMany(AttendanceDetail, {
  foreignKey: "attendanceId",
  // as: "details",
});

AttendanceDetail.belongsTo(Attendance, {
  foreignKey: "attendanceId",
  // as: "attendance",
});

Enrollment.hasMany(AttendanceDetail, {
  foreignKey: "enrollmentId",
  // as: "attendanceDetails",
});

AttendanceDetail.belongsTo(Enrollment, {
  foreignKey: "enrollmentId",
  // as: "enrollment",
});

// Teacher wiz attendance
Teacher.hasMany(Attendance, {
  foreignKey: "takenBy",
  // as: "attendances",
});


Attendance.belongsTo(Teacher, {
  foreignKey: "takenBy",
  // as: "teacher",
});

// CourseAssignment -> MarkList
CourseAssignment.hasMany(MarkList, {
  foreignKey: "courseAssignmentId",
  // as: "markLists",
});

MarkList.belongsTo(CourseAssignment, {
  foreignKey: "courseAssignmentId",
  // as: "courseAssignment",
});


// MarkList -> MarkDetail
MarkList.hasMany(MarkDetail, {
  foreignKey: "markListId",
});

MarkDetail.belongsTo(MarkList, {
  foreignKey: "markListId",
  // as: "markList",
});


// Enrollment -> MarkDetail
Enrollment.hasMany(MarkDetail, {
  foreignKey: "enrollmentId",
});

MarkDetail.belongsTo(Enrollment, {
  foreignKey: "enrollmentId",
  // as: "student",
});


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
  StaffUser,
  Class,
  AcademicYear,
  AttendanceDetail,
  CourseAssignment,
  
};
