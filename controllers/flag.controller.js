const { Flag, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a flag on a user
exports.createFlag = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, flagType, severity = 'LOW', note } = req.body;
    const createdBy = req.user?.id || req.body.createdBy;

    if (!userId || !flagType) {
      await transaction.rollback();
      return res.status(400).json({ message: 'userId and flagType are required' });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const item = await Flag.create({ userId, flagType, severity, note, createdBy, active: true }, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// List flags with filters
exports.getAllFlags = async (req, res) => {
  try {
    const { userId, flagType, severity, active } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (flagType) where.flagType = flagType;
    if (severity) where.severity = severity;
    if (active !== undefined) where.active = active === 'true' || active === true;

    const rows = await Flag.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get flag by id
exports.getFlagById = async (req, res) => {
  try {
    const item = await Flag.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Flag not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update flag (type, note, severity)
exports.updateFlag = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Flag.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Flag not found' });
    }

    const { flagType, severity, note, active } = req.body;
    await item.update({ flagType, severity, note, active }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Deactivate a flag
exports.deactivateFlag = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Flag.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Flag not found' });
    }

    await item.update({ active: false }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete flag
exports.deleteFlag = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Flag.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Flag not found' });
    }

    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
