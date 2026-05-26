const { StudentCourse, User, Course, sequelize } = require('../models');
const { Op } = require('sequelize');

// List all enrollments with optional filters
exports.getAllEnrollments = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;

    const rows = await StudentCourse.findAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single enrollment
exports.getEnrollmentById = async (req, res) => {
  try {
    const item = await StudentCourse.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Enrollment not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll a student into a course
exports.createEnrollment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'studentId and courseId are required' });
    }

    const student = await User.findOne({ where: { id: studentId, role: 'STUDENT' }, transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }

    const existing = await StudentCourse.findOne({ where: { studentId, courseId }, transaction });
    if (existing) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    const item = await StudentCourse.create({ studentId, courseId }, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Remove an enrollment
exports.deleteEnrollment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await StudentCourse.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get all courses for a student
exports.getCoursesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const rows = await StudentCourse.findAll({
      where: { studentId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] }],
      order: [[{ model: Course, as: 'course' }, 'courseName', 'ASC']]
    });
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students for a course
exports.getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Fetch course
    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'courseName'],
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Fetch enrolled students
    const enrollments = await StudentCourse.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
      order: [[{ model: User, as: 'student' }, 'fullName', 'ASC']],
    });

    const students = enrollments.map((e) => e.student);

    res.status(200).json({
      courseId: course.id,
      courseName: course.courseName,
      students,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

