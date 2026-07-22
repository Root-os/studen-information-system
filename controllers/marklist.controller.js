// const {
//   MarkList,
//   MarkDetail,
//   Enrollment,
//   CourseAssignment,
// } = require("../models");
const MarkList = require("../models/mark");
const MarkDetail = require("../models/markDetail");
const Enrollment = require("../models/enrollment");
const CourseAssignment = require("../models/courseAssignment");
const Teacher = require("../models/teacher");
const Course = require("../models/courses");
const Class = require("../models/class");
const AcademicYear = require("../models/academicYear");
const User = require("../models/user");

// Create Mark List + Student Marks
exports.createMarkList = async (req, res) => {
  const transaction = await MarkList.sequelize.transaction();

  try {
    const { courseAssignmentId, marks } = req.body;
    const user = req.user;

    // Validate marks payload
    if (!Array.isArray(marks) || marks.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    // Check Course Assignment
    const courseAssignment =
      await CourseAssignment.findByPk(courseAssignmentId);

    if (!courseAssignment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Course assignment not found.",
      });
    }

    // Authorization
    if (user.role === "TEACHER" && courseAssignment.teacherId !== user.id) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "You are not assigned to this course.",
      });
    }

    // Prevent duplicate mark list
    const existingMarkList = await MarkList.findOne({
      where: {
        courseAssignmentId,
      },
    });

    if (existingMarkList) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Marks have already been recorded for this course.",
      });
    }

    // Validate enrollments
    const enrollmentIds = [...new Set(marks.map((item) => item.enrollmentId))];

    const validEnrollmentCount = await Enrollment.count({
      where: {
        id: enrollmentIds,
        classId: courseAssignment.classId,
        academicYearId: courseAssignment.academicYearId,
      },
    });

    if (validEnrollmentCount !== enrollmentIds.length) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "One or more students are not enrolled in the selected class and academic year.",
      });
    }

    // Create Mark List
    const markList = await MarkList.create(
      {
        courseAssignmentId,
        createdBy: user.id, // Logged-in user
      },
      {
        transaction,
      },
    );

    // Prepare Mark Details
    const markDetails = marks.map((item) => ({
      markListId: markList.id,
      enrollmentId: item.enrollmentId,
      mark: item.mark,
    }));

    // Save Marks
    await MarkDetail.bulkCreate(markDetails, {
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Marks recorded successfully.",
      data: markList,
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllMarkLists = async (req, res) => {
  try {
    const user = req.user;

    const {
      teacherId,
      classId,
      courseId,
      academicYearId,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereCourseAssignment = {};

    if (user?.role?.name?.toLowerCase() === "teacher") {
      whereCourseAssignment.teacherId = user.id;
    } else if (teacherId) {
      whereCourseAssignment.teacherId = teacherId;
    }

    if (classId) whereCourseAssignment.classId = classId;
    if (courseId) whereCourseAssignment.courseId = courseId;
    if (academicYearId)
      whereCourseAssignment.academicYearId = academicYearId;

    const { count, rows } = await MarkList.findAndCountAll({
      include: [
        {
          model: CourseAssignment,
          as: "courseAssignment",
          where: whereCourseAssignment,
          required: Object.keys(whereCourseAssignment).length > 0,
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
              model: Teacher,
              as: "teacher",
              attributes: ["id", "fullName", "phone", "userName"],
            },
            {
              model: AcademicYear,
              attributes: ["id", "yearName"],
            },
          ],
        },
        {
          model: MarkDetail,
          as: "markDetails",
          include: [
            {
              model: Enrollment,
              include: [
                {
                  model: User,
                  attributes: ["id", "fullName", "phone"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    const data = rows.map((markList) => ({
      id: markList.id,
      createdBy: markList.createdBy,
      createdAt: markList.createdAt,
      updatedAt: markList.updatedAt,

      courseAssignment: {
        id: markList.courseAssignment.id,
        course: markList.courseAssignment.course,
        class: markList.courseAssignment.class,
        teacher: markList.courseAssignment.teacher,
        academicYear: markList.courseAssignment.academicYear,
      },

      marks: markList.markDetails.map((detail) => ({
        id: detail.id,
        mark: detail.mark,
        createdAt: detail.createdAt,

        enrollment: {
          id: detail.enrollment.id,
          enrollmentDate: detail.enrollment.enrollmentDate,
          status: detail.enrollment.status,
        },

        student: detail.enrollment.User,
      })),
    }));

    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      pageSize: Number(limit),
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

// Get single mark list
exports.getMarkListById = async (req, res) => {
  try {
    const { id } = req.params;

    const markList = await MarkList.findByPk(id, {
      include: [
        {
          model: CourseAssignment,
          as: "courseAssignment",
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
              model: Teacher,
              as: "teacher",
              attributes: ["id", "fullName", "phone", "userName"],
            },
            {
              model: AcademicYear,
              attributes: ["id", "yearName"],
            },
          ],
        },
        {
          model: MarkDetail,
          as: "markDetails",
          include: [
            {
              model: Enrollment,
              as: "enrollment",
              include: [
                {
                  model: User,
                  attributes: ["id", "fullName", "phone"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!markList) {
      return res.status(404).json({
        success: false,
        message: "Mark list not found",
      });
    }

    const data = {
      id: markList.id,
      createdBy: markList.createdBy,
      createdAt: markList.createdAt,
      updatedAt: markList.updatedAt,

      courseAssignment: {
        id: markList.courseAssignment.id,
        course: markList.courseAssignment.course,
        class: markList.courseAssignment.class,
        teacher: markList.courseAssignment.teacher,
        academicYear: markList.courseAssignment.academicYear,
      },

      marks: markList.markDetails.map((detail) => ({
        id: detail.id,
        mark: detail.mark,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,

        enrollment: {
          id: detail.enrollment.id,
          enrollmentDate: detail.enrollment.enrollmentDate,
          status: detail.enrollment.status,
        },

        student: detail.enrollment.User,
      })),
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a student's mark
exports.updateMark = async (req, res) => {
  try {
    const { id } = req.params;

    const { mark } = req.body;

    const detail = await MarkDetail.findByPk(id);

    if (!detail) {
      return res.status(404).json({
        message: "Mark record not found",
      });
    }

    detail.mark = mark;

    await detail.save();

    res.json({
      message: "Mark updated successfully",
      data: detail,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update entire mark list
exports.updateMarkList = async (req, res) => {
  const transaction = await MarkList.sequelize.transaction();

  try {
    const { id } = req.params;
    const { marks } = req.body;
    const user = req.user;

    if (!Array.isArray(marks) || marks.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    const markList = await MarkList.findByPk(id, {
      include: [
        {
          model: CourseAssignment,
          as: "courseAssignment",
        },
      ],
      transaction,
    });

    if (!markList) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Mark list not found.",
      });
    }

    // Authorization
    if (
      user.role === "TEACHER" &&
      markList.courseAssignment.teacherId !== user.id
    ) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this mark list.",
      });
    }

    // Validate enrollments
    const enrollmentIds = [...new Set(marks.map((m) => m.enrollmentId))];

    const validEnrollmentCount = await Enrollment.count({
      where: {
        id: enrollmentIds,
        classId: markList.courseAssignment.classId,
        academicYearId: markList.courseAssignment.academicYearId,
      },
      transaction,
    });

    if (validEnrollmentCount !== enrollmentIds.length) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "One or more students are not enrolled in the selected class and academic year.",
      });
    }

    // Update marks
    for (const item of marks) {
      if (item.mark < 0 || item.mark > 100) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Invalid mark for enrollment ${item.enrollmentId}.`,
        });
      }

      const detail = await MarkDetail.findOne({
        where: {
          markListId: id,
          enrollmentId: item.enrollmentId,
        },
        transaction,
      });

      if (!detail) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: `Mark not found for enrollment ${item.enrollmentId}.`,
        });
      }

      detail.mark = item.mark;

      await detail.save({ transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Mark list updated successfully.",
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete student mark
exports.deleteMark = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await MarkDetail.findByPk(id);
    if (!detail) {
      return res.status(404).json({
        message: "Mark not found",
      });
    }
    await detail.destroy();
    res.json({
      message: "Mark deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete entire mark list
exports.deleteMarkList = async (req, res) => {
  try {
    const { id } = req.params;

    const markList = await MarkList.findByPk(id);

    if (!markList) {
      return res.status(404).json({
        message: "Mark list not found",
      });
    }

    await MarkDetail.destroy({
      where: {
        markListId: id,
      },
    });

    await markList.destroy();

    res.json({
      message: "Mark list deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get marks by studentId
exports.getMarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const marks = await MarkDetail.findAll({
      include: [
        {
          model: Enrollment,
          as: "enrollment",
          where: {
            studentId,
          },

          include: [
            {
              model: MarkList,
              as: "markLists",
            },
          ],
        },
      ],
    });

    res.json(marks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
