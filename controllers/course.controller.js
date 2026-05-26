const { Course, User, StudentCourse, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { grade } = req.query;
    const whereClause = grade ? { grade } : {};
    
    const courses = await Course.findAll({
      where: whereClause,
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new course (Admin only)
exports.createCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { courseName, courseCode, grade } = req.body;
    
    // Check if course with same code already exists
    const existingCourse = await Course.findOne({
      where: { courseCode },
      transaction
    });
    
    if (existingCourse) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Course with this code already exists' });
    }
    
    const course = await Course.create(
      { courseName, courseCode, grade },
      { transaction }
    );
    
    await transaction.commit();
    res.status(201).json(course);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update course (Admin only)
exports.updateCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { courseName, courseCode, grade } = req.body;
    const course = await Course.findByPk(req.params.id, { transaction });
    
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if new course code is already taken
    if (courseCode && courseCode !== course.courseCode) {
      const existingCourse = await Course.findOne({
        where: { courseCode, id: { [Op.ne]: course.id } },
        transaction
      });
      
      if (existingCourse) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Course code already in use' });
      }
    }
    
    await course.update(
      { courseName, courseCode, grade },
      { transaction }
    );
    
    await transaction.commit();
    res.status(200).json(course);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete course (Admin only)
exports.deleteCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const course = await Course.findByPk(req.params.id, { transaction });
    
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }
    
    await course.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Enroll student in course
exports.enrollStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { studentId } = req.body;
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student exists and is a student
    const student = await User.findOne({
      where: { id: studentId, role: 'STUDENT' },
      transaction
    });
    
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await StudentCourse.findOne({
      where: { studentId, courseId },
      transaction
    });
    
    if (existingEnrollment) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    
    // Enroll student
    await StudentCourse.create(
      { studentId, courseId },
      { transaction }
    );
    
    await transaction.commit();
    res.status(200).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
