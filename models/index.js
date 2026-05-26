const {
  sequelize,
  User,
  Course,
  StudentCourse,
  MarkList,
  Attendance,
  Complain,
  Punishment,
  Permission,
  Flag,
  Blog,
  Management,
  Department,
  UserDepartment,
  Letter
} = require('./exportModels');

/**
 * Define all model associations with proper cascade rules
 */
const defineAssociations = () => {
  // User Associations
  User.hasMany(StudentCourse, {
    foreignKey: 'studentId',
    as: 'studentCourses',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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

  Course.hasMany(MarkList, {
    foreignKey: 'courseId',
    as: 'marks',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // MarkList Associations
  MarkList.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  MarkList.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'teacher',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  MarkList.belongsTo(Course, {
    foreignKey: 'courseId',
    as: 'course',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

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
  User.hasMany(MarkList, {
    foreignKey: 'studentId',
    as: 'marks',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

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

Course.hasMany(Attendance, {
  foreignKey: "courseId",
  as: "attendances",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
Attendance.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

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
};

module.exports = {
  defineAssociations,
  // Re-export models for backward compatibility
  sequelize,
  User,
  Course,
  StudentCourse,
  MarkList,
  Attendance,
  Complain,
  Punishment,
  Permission,
  Flag,
  Blog,
  Management,
  Department,
  UserDepartment,
  Letter
};
