const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/courses");
const Teacher = require("../models/teacher");
const Class = require("../models/class");
const AcademicYear = require("../models/academicYear"); 

exports.createCourseAssignment = async (req, res) => {
  try {
    const {
      courseId,
      classId,
      teacherId,
      academicYearId,
    } = req.body;

    if (!courseId || !classId || !teacherId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    const classData = await Class.findByPk(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const academicYear = await AcademicYear.findByPk(academicYearId);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found.",
      });
    }

    const existing = await CourseAssignment.findOne({
      where: {
        courseId,
        classId,
        academicYearId,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "This course has already been assigned to this class for the selected academic year.",
      });
    }

    const assignment = await CourseAssignment.create({
      courseId,
      classId,
      teacherId,
      academicYearId,
    });

    return res.status(201).json({
      success: true,
      message: "Course assignment created successfully.",
      data: assignment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getAllCourseAssignments = async (req, res) => {
  try {

    const assignments = await CourseAssignment.findAll({
      include: [
        {
          model: Course,
          as: "course",
        },
        {
          model: Teacher,
          as: "teacher",
        },
        {
          model: Class,
          as: "class",
        },
        {
          model: AcademicYear,
          as: "academicYear",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getCourseAssignmentById = async (req, res) => {
  try {

    const assignment = await CourseAssignment.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: "course",
        },
        {
          model: Teacher,
          as: "teacher",
        },
        {
          model: Class,
          as: "class",
        },
        {
          model: AcademicYear,
          as: "academicYear",
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Course assignment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.updateCourseAssignment = async (req, res) => {
  try {

    const assignment = await CourseAssignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Course assignment not found.",
      });
    }

    const {
      teacherId,
    } = req.body;

    if (teacherId) {
      const teacher = await Teacher.findByPk(teacherId);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found.",
        });
      }
    }

    await assignment.update({
      teacherId,
    });

    return res.status(200).json({
      success: true,
      message: "Course assignment updated successfully.",
      data: assignment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.deleteCourseAssignment = async (req, res) => {
  try {

    const assignment = await CourseAssignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Course assignment not found.",
      });
    }

    await assignment.destroy();

    return res.status(200).json({
      success: true,
      message: "Course assignment deleted successfully.",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Cannot delete course assignment because it is being used.",
    });

  }
};

exports.getTeachersByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findByPk(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const assignments = await CourseAssignment.findAll({
      where: {
        classId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "fullName", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Remove duplicate teachers
    const teachers = [];
    const teacherIds = new Set();

    assignments.forEach((assignment) => {
      if (
        assignment.teacher &&
        !teacherIds.has(assignment.teacher.id)
      ) {
        teacherIds.add(assignment.teacher.id);
        teachers.push(assignment.teacher);
      }
    });

    return res.status(200).json({
      success: true,
      class: classData,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};