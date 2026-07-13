const Enrollment = require("../models/enrollment");
const User = require("../models/user");
const Class = require("../models/class");
const AcademicYear = require("../models/academicYear");

exports.createEnrollment = async (req, res) => {
  try {
    const {
      studentId,
      classId,
      academicYearId,
      enrollmentDate,
      status,
    } = req.body;

    if (!studentId || !classId || !academicYearId || !enrollmentDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const student = await User.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
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

    const existing = await Enrollment.findOne({
      where: {
        studentId,
        academicYearId,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this academic year.",
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      classId,
      academicYearId,
      enrollmentDate,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Enrollment created successfully.",
      data: enrollment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getAllEnrollments = async (req, res) => {
  try {

    const enrollments = await Enrollment.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "fullName"]
        },
        {
          model: Class,
          attributes: ["id", "className"]
        },
        {
          model: AcademicYear,
          attributes: ["id", "yearName"]
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getEnrollmentById = async (req, res) => {
  try {

    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "fullName"]
        },
        {
          model: Class,
          attributes: ["id", "className"]
        },
        {
          model: AcademicYear,
          attributes: ["id", "yearName"]
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.updateEnrollment = async (req, res) => {
  try {

    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    const {
      classId,
      enrollmentDate,
      status,
    } = req.body;

    await enrollment.update({
      classId,
      enrollmentDate,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully.",
      data: enrollment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.deleteEnrollment = async (req, res) => {
  try {

    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    await enrollment.destroy();

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully.",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Cannot delete enrollment because it is being used.",
    });

  }
};

exports.getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findByPk(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const enrollments = await Enrollment.findAll({
      where: {
        classId,
        status: "ACTIVE",
      },
      include: [
        {
          model: User,
          attributes: ["id", "fullName", "phone"],
        },
      ],
      order: [[User, "fullName", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      class: {
        id: classData.id,
        className: classData.className,
      },
      count: enrollments.length,
      data: enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        studentId: enrollment.User.id,
        fullName: enrollment.User.fullName,
        phone: enrollment.User.phone,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

