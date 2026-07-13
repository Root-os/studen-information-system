const sequelize = require("../config/database");

const Attendance = require("../models/attendance");
const AttendanceDetail = require("../models/attendanceDetail");
const CourseAssignment = require("../models/courseAssignment");
const Teacher = require("../models/teacher");
const Enrollment = require("../models/enrollment");
const Course = require("../models/courses");
const Class = require("../models/class");
const AcademicYear = require("../models/academicYear");
const User = require("../models/user");

exports.createAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      courseAssignmentId,
      attendanceDate,
      takenBy,
      students,
    } = req.body;

    if (
      !courseAssignmentId ||
      !attendanceDate ||
      !takenBy ||
      !students ||
      students.length === 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }


    // Check course assignment exists
    const assignment = await CourseAssignment.findByPk(
      courseAssignmentId
    );

    if (!assignment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Course assignment not found.",
      });
    }


    // Check teacher exists
    const teacher = await Teacher.findByPk(takenBy);

    if (!teacher) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }


    // Prevent duplicate attendance only for same assignment + date + teacher
    const existing = await Attendance.findOne({
      where: {
        courseAssignmentId,
        attendanceDate,
        takenBy,
      },
    });


    if (existing) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this course, class and date.",
      });
    }


    // Create attendance header
    const attendance = await Attendance.create(
      {
        courseAssignmentId,
        attendanceDate,
        takenBy,
      },
      {
        transaction,
      }
    );


    // Create attendance details
    const details = students.map((student) => ({
      attendanceId: attendance.id,
      enrollmentId: student.enrollmentId,
      status: student.status,
    }));


    await AttendanceDetail.bulkCreate(details, {
      transaction,
    });


    await transaction.commit();


    return res.status(201).json({
      success: true,
      message: "Attendance saved successfully.",
      data: attendance,
    });


  } catch (error) {

    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      include: [
        {
          model: CourseAssignment,
          include: [
            {
              model: Course,
              attributes: ["id", "courseName"],
            },
            {
              model: Class,
              attributes: ["id", "className"],
            },
            {
              model: AcademicYear,
              attributes: ["id", "yearName"],
            },
          ],
        },
        {
          model: Teacher,
          attributes: ["id", "fullName"],
        },
        {
          model: AttendanceDetail,
          attributes: ["id", "status"],
        },
      ],
      order: [["attendanceDate", "DESC"]],
    });
    // console.log(JSON.stringify(attendance[0].toJSON(), null, 2));

    const data = attendance.map((item) => {
      const details = item.attendanceDetails || [];

      return {
        id: item.id,
        attendanceDate: item.attendanceDate,
        remark: item.remark,

        teacher: item.Teacher,

        course: item.courseAssignment?.course,

        class: item.courseAssignment?.class,

        academicYear: item.courseAssignment?.academicYear,

        totalStudents: details.length,

        present: details.filter((d) => d.status === "PRESENT").length,

        absent: details.filter((d) => d.status === "ABSENT").length,

        late: details.filter((d) => d.status === "LATE").length,

        excused: details.filter((d) => d.status === "EXCUSED").length,

        byPermission: details.filter((d) => d.status === "BY_PERMISSION")
          .length,
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          attributes: ["id", "fullName"],
        },
        {
          model: CourseAssignment,
          include: [
            {
              model: Course,
              attributes: ["id", "courseName"],
            },
            {
              model: Class,
              attributes: ["id", "className"],
            },
            {
              model: AcademicYear,
              attributes: ["id", "yearName"],
            },
          ],
        },
        {
          model: AttendanceDetail,
          include: [
            {
              model: Enrollment,
              attributes: ["id"],
              include: [
                {
                  model: User,
                  attributes: ["id", "fullName"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    const details = attendance.attendanceDetails || [];

    const response = {
      id: attendance.id,
      attendanceDate: attendance.attendanceDate,
      remark: attendance.remark,

      teacher: attendance.Teacher,

      course: attendance.courseAssignment?.course,

      class: attendance.courseAssignment?.class,

      academicYear: attendance.courseAssignment?.academicYear,

      statistics: {
        totalStudents: details.length,
        present: details.filter((d) => d.status === "PRESENT").length,
        absent: details.filter((d) => d.status === "ABSENT").length,
        late: details.filter((d) => d.status === "LATE").length,
        excused: details.filter((d) => d.status === "EXCUSED").length,
        byPermission: details.filter(
          (d) => d.status === "BY_PERMISSION"
        ).length,
      },

      students: details.map((detail) => ({
        attendanceDetailId: detail.id,
        enrollmentId: detail.enrollment?.id,
        studentId: detail.enrollment?.User?.id,
        fullName: detail.enrollment?.User?.fullName,
        status: detail.status,
        remark: detail.remark,
      })),
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found.",
      });
    }

    await attendance.destroy();

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
