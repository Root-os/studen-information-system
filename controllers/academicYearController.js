const AcademicYear = require('../models/academicYear');
const Enrollment = require('../models/enrollment');
const CourseAssignment = require('../models/courseAssignment');

exports.createAcademicYear = async (req, res) => {
  try {
    const { yearName, startDate, endDate, isCurrent } = req.body;

    if (!yearName) {
      return res.status(400).json({
        success: false,
        message: "Academic year name is required.",
      });
    }

    const existing = await AcademicYear.findOne({
      where: { yearName },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Academic year already exists.",
      });
    }

    if (isCurrent) {
      await AcademicYear.update(
        { isCurrent: false },
        { where: {} }
      );
    }

    const academicYear = await AcademicYear.create({
      yearName,
      startDate,
      endDate,
      isCurrent: isCurrent || false,
    });

    res.status(201).json({
      success: true,
      data: academicYear,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllAcademicYears = async (req, res) => {
  try {

    const academicYears = await AcademicYear.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: academicYears.length,
      data: academicYears,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getCurrentAcademicYear = async (req, res) => {
  try {

    const academicYear = await AcademicYear.findOne({
      where: {
        isCurrent: true,
      },
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "No current academic year found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: academicYear,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAcademicYearById = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: academicYear,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { yearName, startDate, endDate, isCurrent } = req.body;

    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found.",
      });
    }

    // Check duplicate year name
    if (yearName && yearName !== academicYear.yearName) {
      const exists = await AcademicYear.findOne({
        where: { yearName },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Academic year already exists.",
        });
      }
    }

    // Make this the only current academic year
    if (isCurrent === true) {
      await AcademicYear.update(
        { isCurrent: false },
        { where: {} }
      );
    }

    await academicYear.update({
      yearName,
      startDate,
      endDate,
      isCurrent,
    });

    return res.status(200).json({
      success: true,
      message: "Academic year updated successfully.",
      data: academicYear,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setCurrentAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found.",
      });
    }

    await AcademicYear.update(
      { isCurrent: false },
      { where: {} }
    );

    await academicYear.update({
      isCurrent: true,
    });

    return res.status(200).json({
      success: true,
      message: "Current academic year updated successfully.",
      data: academicYear,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found.",
      });
    }

    const enrollmentCount = await Enrollment.count({
      where: {
        academicYearId: id,
      },
    });

    const assignmentCount = await CourseAssignment.count({
      where: {
        academicYearId: id,
      },
    });

    if (enrollmentCount > 0 || assignmentCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete academic year because it has related records.",
      });
    }

    await academicYear.destroy();

    return res.status(200).json({
      success: true,
      message: "Academic year deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

