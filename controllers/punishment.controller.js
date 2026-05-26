const { Punishment, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create punishment
exports.createPunishment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const payload = req.body; // expected fields depend on model (e.g., studentId, reason, action, date)

    if (!payload.studentId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'studentId is required' });
    }

    const student = await User.findByPk(payload.studentId, { transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    const item = await Punishment.create(payload, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// List punishments with optional filters
exports.getAllPunishments = async (req, res) => {
  try {
    const { studentId, from, to, q } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (q) where.reason = { [Op.iLike || Op.substring]: `%${q}%` };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const items = await Punishment.findAll({ where, order: [['createdAt', 'DESC']] });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get punishment by id
exports.getPunishmentById = async (req, res) => {
  try {
    const item = await Punishment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Punishment not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update punishment
exports.updatePunishment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Punishment.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Punishment not found' });
    }

    await item.update(req.body, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete punishment
exports.deletePunishment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Punishment.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Punishment not found' });
    }

    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
