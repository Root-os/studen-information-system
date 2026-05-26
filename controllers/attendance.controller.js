const { Attendance, User, Course, StudentCourse, sequelize } = require('../models');
const { Op } = require('sequelize');


// Get all attendance grouped by course, date, and teacher
exports.getAllAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, attendance } = req.query;
    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (courseId) whereClause.courseId = courseId;
    if (date) whereClause.date = date;
    if (attendance) whereClause.attendance = attendance;

    const records = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'courseCode'],
        },
      ],
      order: [['date', 'DESC'], ['courseId', 'ASC']],
    });

    // Group the records
    const grouped = [];
    const map = new Map();

    for (const r of records) {
      const key = `${r.courseId}-${r.date}-${r.teacherId}`;
      if (!map.has(key)) {
        const group = {
          courseId: r.course.id,
          courseName: r.course.courseName,
          courseCode: r.course.courseCode,
          date: r.date,
          teacher: r.teacher,
          students: [],
        };
        map.set(key, group);
        grouped.push(group);
      }
      map.get(key).students.push({
        attendanceId: r.id,     // <-- include attendance ID here
        id: r.student.id,
        fullName: r.student.fullName,
        email: r.student.email,
        attendance: r.attendance,
      });
    }

    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single attendance record by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'courseCode'],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Return as grouped object
    const result = {
      courseId: record.course.id,
      courseName: record.course.courseName,
      courseCode: record.course.courseCode,
      date: record.date,
      teacher: record.teacher,
      students: [
        {
          attendanceId: record.id, // <-- include attendance ID here
          id: record.student.id,
          fullName: record.student.fullName,
          email: record.student.email,
          attendance: record.attendance,
        },
      ],
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new attendance record
exports.createAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { courseId, date, teacherId, records } = req.body;

    // Validate required fields
    if (!courseId || !date || !teacherId || !records || !Array.isArray(records) || records.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "courseId, teacherId, date, and records (non-empty array) are required",
      });
    }

    // Check course exists
    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: "Course not found" });
    }

    const attendanceData = [];

    for (const r of records) {
      const { studentId, attendance } = r;

      if (!studentId || !attendance) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Each record must have studentId and attendance",
        });
      }

      // Check student exists
      const student = await User.findOne({
        where: { id: studentId, role: "STUDENT" },
        transaction,
      });

      if (!student) {
        await transaction.rollback();
        return res.status(404).json({ message: `Student ${studentId} not found` });
      }

      // Check enrollment
      const enrollment = await StudentCourse.findOne({
        where: { studentId, courseId },
        transaction,
      });

      if (!enrollment) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Student ${studentId} is not enrolled in course ${courseId}`,
        });
      }

      // Check duplicate attendance
      const existing = await Attendance.findOne({
        where: { studentId, courseId, date },
        transaction,
      });

      if (existing) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Attendance already marked for student ${studentId} on ${date}`,
        });
      }

      attendanceData.push({
        studentId,
        courseId,
        teacherId,
        date,
        attendance,
      });
    }

    const createdRecords = await Attendance.bulkCreate(attendanceData, { transaction });

    await transaction.commit();
    return res.status(201).json({
      message: "Attendance recorded successfully",
      records: createdRecords,
    });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { attendance: attendanceStatus } = req.body;
    
    const record = await Attendance.findByPk(req.params.id, { transaction });
    if (!record) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Update only the fields that are provided
    if (attendanceStatus) record.attendance = attendanceStatus;
    
    await record.save({ transaction });
    await transaction.commit();
    
    res.status(200).json(record);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const attendance = await Attendance.findByPk(req.params.id, { transaction });
    
    if (!attendance) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    await attendance.destroy({ transaction });
    await transaction.commit();
    
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get student attendance summary
exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ 
        message: 'Student ID is required' 
      });
    }
    
    // Set default date range if not provided (current month)
    const start = startDate || new Date();
    start.setDate(1); // First day of the month
    start.setHours(0, 0, 0, 0);
    
    const end = endDate || new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Last day of the month
    end.setHours(23, 59, 59, 999);
    
    // Get all attendance records for the student in the given course and date range
    const attendanceRecords = await Attendance.findAll({
      where: {
        studentId,
        date: {
          [Op.between]: [start, end]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Calculate summary
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.attendance === 'PRESENT').length;
    const absentCount = attendanceRecords.filter(a => a.attendance === 'ABSENT').length;
    
    const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
    res.status(200).json({
      studentId,
      dateRange: {
        start,
        end
      },
      totalClasses,
      presentCount,
      absentCount,
      attendancePercentage: `${attendancePercentage}%`,
      attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceByTeacher = async (req, res) => {
  try {
    const { teacherId, courseId, date } = req.query;

    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required" });
    }

    const whereClause = { teacherId };

    if (courseId) whereClause.courseId = courseId;
    if (date) whereClause.date = date;

    const records = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'courseCode'],
        },
      ],
      order: [['date', 'ASC']],
    });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
