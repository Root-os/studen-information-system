const { Complain, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a complaint
exports.createComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { complainant, respondant, complaint } = req.body;

    // 1️⃣ Basic required fields check
    if (!complainant || !respondant || !complaint) {
      await transaction.rollback();
      return res.status(400).json({
        message: "complainant, respondant and complaint are required",
      });
    }

    // 2️⃣ Prevent same user for complainant and respondent
    if (complainant === respondant) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Complainant and respondent cannot be the same user",
      });
    }

    // 3️⃣ Check if users exist
    const complainantUser = await User.findByPk(complainant, { transaction });
    const respondentUser = await User.findByPk(respondant, { transaction });

    if (!complainantUser || !respondentUser) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Complainant or respondent not found",
      });
    }

    // 4️⃣ Create complaint
    const record = await Complain.create(
      {
        complainant,
        respondant,
        complaint,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json(record);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// List complaints with filters
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, complainant, respondant, q, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (complainant) where.complainant = complainant;
    if (respondant) where.respondant = respondant;
    if (q) where.complaint = { [Op.iLike || Op.substring]: `%${q}%` };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const items = await Complain.findAll({
      where,
      include: [
        { model: User, as: 'complainantUser', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: User, as: 'respondentUser', attributes: ['id', 'fullName', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint by id
exports.getComplaintById = async (req, res) => {
  try {
    const item = await Complain.findByPk(req.params.id, {
      include: [
        { model: User, as: 'complainantUser', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'respondentUser', attributes: ['id', 'fullName', 'email'] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Complaint not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint (complainant can edit before processed)
exports.updateComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (item.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending complaints can be edited' });
    }

    const { complaint } = req.body;
    await item.update({ complaint }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update complaint status (admin or respondent)
exports.updateComplaintStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status, resolutionNotes } = req.body; // statuses: pending, in_progress, resolved, rejected
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await item.update({ status, resolutionNotes }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Complain.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Complaint not found' });
    }
    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get my complaints (for the logged-in user)
exports.getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Complain.findAll({
      where: { complainant: userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complaint stats
exports.getComplaintStats = async (req, res) => {
  try {
    const counts = await Promise.all([
      Complain.count({ where: { status: 'pending' } }),
      Complain.count({ where: { status: 'in_progress' } }),
      Complain.count({ where: { status: 'resolved' } }),
      Complain.count({ where: { status: 'rejected' } })
    ]);
    res.status(200).json({
      pending: counts[0],
      in_progress: counts[1],
      resolved: counts[2],
      rejected: counts[3]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
