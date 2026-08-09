const {
  Complain,
  User,
  Teacher,
  Class,
  AcademicYear,
  Enrollment,
  CourseAssignment,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');


function complainIncludes() {
  return [
    {
      model: User,
      as: 'complainantStudent',
      attributes: ['id', 'fullName', 'studentId'],
      required: false,
    },
    {
      model: Teacher,
      as: 'complainantTeacher',
      attributes: ['id', 'fullName', 'userName'],
      required: false,
    },
    {
      model: User,
      as: 'respondantStudent',
      attributes: ['id', 'fullName', 'studentId'],
      required: false,
    },
    {
      model: Teacher,
      as: 'respondantTeacher',
      attributes: ['id', 'fullName', 'userName'],
      required: false,
    },
    {
      model: Class,
      as: 'complainClass',
      attributes: ['id', 'className'],
      required: false,
    },
    {
      model: AcademicYear,
      as: 'complainAcademicYear',
      attributes: ['id', 'yearName'],
      required: false,
    },
  ];
}

// ─── Membership checks ────────────────────────────────────────────────────────

async function teacherAssignedToClass(teacherId, classId, academicYearId, transaction) {
  const row = await CourseAssignment.findOne({
    where: { teacherId, classId, academicYearId },
    transaction,
  });
  return !!row;
}

async function studentEnrolledInClass(studentId, classId, academicYearId, transaction) {
  const row = await Enrollment.findOne({
    where: { studentId, classId, academicYearId, status: 'ACTIVE' },
    transaction,
  });
  return !!row;
}

// ─── Create ───────────────────────────────────────────────────────────────────

exports.createComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      complainant,
      complainantType,
      respondant,
      respondantType,
      classId,
      academicYearId,
      complaint,
    } = req.body;

    // Prevent self-complaint
    if (complainant === respondant && complainantType === respondantType) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Complainant and respondant cannot be the same person.' });
    }

    // Only valid flows: teacher→student, student→teacher, student→student
    let category;
    if (complainantType === 'teacher' && respondantType === 'student') {
      category = 'teacher_to_student';
    } else if (complainantType === 'student' && respondantType === 'teacher') {
      category = 'student_to_teacher';
    } else if (complainantType === 'student' && respondantType === 'student') {
      category = 'student_to_student';
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: 'A teacher cannot file a complaint against another teacher.' });
    }

    // Verify class exists
    const classRecord = await Class.findByPk(classId, { transaction });
    if (!classRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Class not found.' });
    }

    // Verify academic year exists
    const yearRecord = await AcademicYear.findByPk(academicYearId, { transaction });
    if (!yearRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    // Validate complainant membership
    if (complainantType === 'teacher') {
      const ok = await teacherAssignedToClass(complainant, classId, academicYearId, transaction);
      if (!ok) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'The teacher filing this complaint is not assigned to the specified class and academic year.',
        });
      }
    } else {
      const ok = await studentEnrolledInClass(complainant, classId, academicYearId, transaction);
      if (!ok) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'The student filing this complaint is not actively enrolled in the specified class and academic year.',
        });
      }
    }

    // Validate respondant membership
    if (respondantType === 'teacher') {
      const ok = await teacherAssignedToClass(respondant, classId, academicYearId, transaction);
      if (!ok) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'The teacher being complained about is not assigned to the specified class and academic year.',
        });
      }
    } else {
      const ok = await studentEnrolledInClass(respondant, classId, academicYearId, transaction);
      if (!ok) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'The student being complained about is not actively enrolled in the specified class and academic year.',
        });
      }
    }

    const record = await Complain.create(
      { complainant, complainantType, respondant, respondantType, classId, academicYearId, category, complaint },
      { transaction }
    );

    await transaction.commit();

    const result = await Complain.findByPk(record.id, { include: complainIncludes() });
    return res.status(201).json(result);
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// ─── List all (with filters) ──────────────────────────────────────────────────

exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, classId, academicYearId, q, from, to } = req.query;
    const where = {};

    if (status)         where.status         = status;
    if (category)       where.category       = category;
    if (classId)        where.classId        = classId;
    if (academicYearId) where.academicYearId = academicYearId;

    if (q) where.complaint = { [Op.like]: `%${q}%` };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to)   where.createdAt[Op.lte] = new Date(to);
    }

    const items = await Complain.findAll({
      where,
      include: complainIncludes(),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Get by ID ────────────────────────────────────────────────────────────────

exports.getComplaintById = async (req, res) => {
  try {
    const item = await Complain.findByPk(req.params.id, { include: complainIncludes() });
    if (!item) return res.status(404).json({ message: 'Complaint not found.' });
    return res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Track: complaints filed BY a party ──────────────────────────────────────
// GET /complaints/track/complainant/:id?type=student|teacher

exports.trackByComplainant = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || !['student', 'teacher'].includes(type)) {
      return res.status(400).json({ message: "Query param 'type' must be 'student' or 'teacher'." });
    }

    const items = await Complain.findAll({
      where: { complainant: id, complainantType: type },
      include: complainIncludes(),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Track: complaints filed AGAINST a party ─────────────────────────────────
// GET /complaints/track/respondant/:id?type=student|teacher

exports.trackByRespondant = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || !['student', 'teacher'].includes(type)) {
      return res.status(400).json({ message: "Query param 'type' must be 'student' or 'teacher'." });
    }

    const items = await Complain.findAll({
      where: { respondant: id, respondantType: type },
      include: complainIncludes(),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Update complaint text (pending only) ────────────────────────────────────

exports.updateComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    if (item.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending complaints can be edited.' });
    }

    await item.update({ complaint: req.body.complaint }, { transaction });
    await transaction.commit();

    const result = await Complain.findByPk(item.id, { include: complainIncludes() });
    return res.status(200).json(result);
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// ─── Update status (admin) ────────────────────────────────────────────────────

exports.updateComplaintStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status, resolutionNotes } = req.body;
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    await item.update({ status, resolutionNotes }, { transaction });
    await transaction.commit();

    const result = await Complain.findByPk(item.id, { include: complainIncludes() });
    return res.status(200).json(result);
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────

exports.deleteComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    await item.destroy({ transaction });
    await transaction.commit();
    return res.status(204).send();
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// ─── Stats summary ────────────────────────────────────────────────────────────

exports.getComplaintStats = async (req, res) => {
  try {
    const [total, pending, in_progress, resolved, rejected] = await Promise.all([
      Complain.count(),
      Complain.count({ where: { status: 'pending' } }),
      Complain.count({ where: { status: 'in_progress' } }),
      Complain.count({ where: { status: 'resolved' } }),
      Complain.count({ where: { status: 'rejected' } }),
    ]);

    const byCategory = await Complain.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    return res.status(200).json({ total, pending, in_progress, resolved, rejected, byCategory });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── Lookup valid respondants ─────────────────────────────────────────────────
// GET /complaints/lookup/respondants?complainantId=&complainantType=&classId=&academicYearId=
// Returns students and teachers active in that class+year, excluding the complainant.

exports.lookupRespondants = async (req, res) => {
  try {
    const { complainantId, complainantType, classId, academicYearId } = req.query;

    if (!complainantId || !complainantType || !classId || !academicYearId) {
      return res.status(400).json({
        message: 'complainantId, complainantType, classId and academicYearId are all required.',
      });
    }

    // Students enrolled in that class+year (exclude complainant if they are a student)
    const enrollmentWhere = { classId, academicYearId, status: 'ACTIVE' };
    if (complainantType === 'student') {
      enrollmentWhere.studentId = { [Op.ne]: complainantId };
    }

    const enrollments = await Enrollment.findAll({
      where: enrollmentWhere,
      include: [{ model: User, as: 'student', attributes: ['id', 'fullName', 'studentId'] }],
    });
    const students = enrollments.map((e) => e.student).filter(Boolean);

    // Teachers assigned to that class+year (exclude complainant if they are a teacher)
    const assignmentWhere = { classId, academicYearId };
    if (complainantType === 'teacher') {
      assignmentWhere.teacherId = { [Op.ne]: complainantId };
    }

    const assignments = await CourseAssignment.findAll({
      where: assignmentWhere,
      include: [{ model: Teacher, as: 'teacher', attributes: ['id', 'fullName', 'userName'] }],
    });

    // Deduplicate (teacher may teach multiple courses in the same class)
    const teacherMap = {};
    assignments.forEach((a) => {
      if (a.teacher) teacherMap[a.teacher.id] = a.teacher;
    });
    const teachers = Object.values(teacherMap);

    return res.status(200).json({ students, teachers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
