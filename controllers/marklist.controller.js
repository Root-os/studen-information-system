const { MarkList, User, Course, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all marks
exports.getAllMarks = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    const whereClause = {};
    
    if (studentId) whereClause.studentId = studentId;
    if (courseId) whereClause.courseId = courseId;
    
    const marks = await MarkList.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'courseName', 'courseCode']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [
        ['courseId', 'ASC'],
        ['studentId', 'ASC']
      ]
    });
    
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get marks by ID
exports.getMarksById = async (req, res) => {
  try {
    const marks = await MarkList.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Course,
          attributes: ['id', 'courseName', 'courseCode']
        }
      ]
    });
    
    if (!marks) {
      return res.status(404).json({ message: 'Marks record not found' });
    }
    
    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update marks (by studentId + courseId)
exports.upsertMarks = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { studentId, courseId, teacherId, mark } = req.body;

    // Validate teacherId
    if (!teacherId) {
      await transaction.rollback();
      return res.status(400).json({ message: "teacherId is required" });
    }

    const teacher = await User.findOne({
      where: { id: teacherId, role: 'TEACHER' },
      transaction
    });
    if (!teacher) {
      await transaction.rollback();
      return res.status(404).json({ message: "Teacher not found" });
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

    // Check if course exists
    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }

    // Upsert marks
    const [marks, created] = await MarkList.findOrCreate({
      where: { studentId, courseId },
      defaults: { teacherId, mark },
      transaction
    });

    if (!created) {
      marks.mark = mark;
      marks.teacherId = teacherId;
      await marks.save({ transaction });
    }

    await transaction.commit();
    res.status(created ? 201 : 200).json(marks);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

//update mark list
exports.updateMark = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const markId = req.params.id;
    const { studentId, courseId, teacherId, mark } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !teacherId || mark === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: "studentId, courseId, teacherId, and mark are required" });
    }

    // Check if mark exists
    const existingMark = await MarkList.findByPk(markId, { transaction });
    if (!existingMark) {
      await transaction.rollback();
      return res.status(404).json({ message: "Mark not found" });
    }

    // Validate student
    const student = await User.findOne({
      where: { id: studentId, role: "STUDENT" },
      transaction,
    });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate course
    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate teacher
    const teacher = await User.findOne({
      where: { id: teacherId, role: "TEACHER" },
      transaction,
    });
    if (!teacher) {
      await transaction.rollback();
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update the mark
    existingMark.studentId = studentId;
    existingMark.courseId = courseId;
    existingMark.teacherId = teacherId;
    existingMark.mark = mark;

    await existingMark.save({ transaction });
    await transaction.commit();

    return res.status(200).json(existingMark);
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// Delete marks
exports.deleteMarks = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const marks = await MarkList.findByPk(req.params.id, { transaction });
    
    if (!marks) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Marks record not found' });
    }
    
    await marks.destroy({ transaction });
    await transaction.commit();
    
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get student grade report
exports.getStudentGradeReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get all marks for the student
    const marks = await MarkList.findAll({
      where: { studentId },
      include: [
        {
          model: Course,
          attributes: ['id', 'courseName', 'courseCode', 'grade']
        }
      ],
      order: [
        ['courseId', 'ASC']
      ]
    });
    
    if (marks.length === 0) {
      return res.status(404).json({ 
        message: 'No marks found for this student' 
      });
    }
    
    // Calculate overall grades per course
    const courseGrades = {};
    marks.forEach(mark => {
      const courseId = mark.courseId;
      if (!courseGrades[courseId]) {
        courseGrades[courseId] = {
          course: mark.Course,
          marks: [],
          totalMarks: 0,
          maxTotalMarks: 0,
          percentage: 0,
          grade: ''
        };
      }
      
      courseGrades[courseId].marks.push({
        value: mark.mark
      });
      
      courseGrades[courseId].totalMarks += mark.mark;
      courseGrades[courseId].maxTotalMarks += 100; // assume out of 100 if not modeled
    });
    
    // Calculate overall percentage and grade for each course
    Object.values(courseGrades).forEach(course => {
      course.percentage = (course.totalMarks / course.maxTotalMarks) * 100;
      course.grade = calculateGrade(course.percentage);
    });
    
    // Calculate overall CGPA (if applicable)
    const courses = Object.values(courseGrades);
    const cgpa = calculateCGPA(courses);
    
    res.status(200).json({
      studentId,
      courses: courses.map(course => ({
        courseId: course.course.id,
        courseName: course.course.courseName,
        courseCode: course.course.courseCode,
        marks: course.marks,
        totalMarks: course.totalMarks,
        maxTotalMarks: course.maxTotalMarks,
        percentage: course.percentage,
        grade: course.grade
      })),
      cgpa: cgpa.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate grade based on percentage
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// Helper function to calculate CGPA (simplified example)
function calculateCGPA(courses) {
  if (courses.length === 0) return 0;
  
  const gradePoints = {
    'A+': 4.0,
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D': 1.5,
    'F': 0
  };
  
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  // Assuming each course has equal weight (1 credit)
  // In a real system, you would get the credits from the course
  courses.forEach(course => {
    const gradePoint = gradePoints[course.grade] || 0;
    totalGradePoints += gradePoint; // * course.credits;
    totalCredits += 1; // course.credits;
  });
  
  return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}
