const { Permission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a permission request
exports.createPermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, type, reason, fromDate, toDate, notes } = req.body;
    if (!userId || !type || !reason || !fromDate) {
      await transaction.rollback();
      return res.status(400).json({ message: 'userId, type, reason and fromDate are required' });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const item = await Permission.create({ userId, type, reason, fromDate, toDate, notes }, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// List permissions (filters)
exports.getAllPermissions = async (req, res) => {
  try {
    const { userId, status, type, from, to } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (from || to) {
      where.fromDate = {};
      if (from) where.fromDate[Op.gte] = new Date(from);
      if (to) where.fromDate[Op.lte] = new Date(to);
    }

    const rows = await Permission.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'fullName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by id
exports.getPermissionById = async (req, res) => {
  try {
    const item = await Permission.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'fullName', 'email'] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Permission not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update (only editable while pending)
exports.updatePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Permission.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Permission not found' });
    }
    if (item.status !== 'PENDING') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending permissions can be edited' });
    }

    const { type, reason, fromDate, toDate, notes } = req.body;
    await item.update({ type, reason, fromDate, toDate, notes }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Approve permission
exports.approvePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const approverId = req.user?.id || req.body.approvedBy;
    const item = await Permission.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Permission not found' });
    }
    if (item.status !== 'PENDING') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending permissions can be approved' });
    }

    await item.update({ status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Reject permission
exports.rejectPermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const approverId = req.user?.id || req.body.approvedBy;
    const { notes } = req.body;
    const item = await Permission.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Permission not found' });
    }
    if (item.status !== 'PENDING') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Only pending permissions can be rejected' });
    }

    await item.update({ status: 'REJECTED', approvedBy: approverId, approvedAt: new Date(), notes }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete
exports.deletePermission = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Permission.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Permission not found' });
    }
    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
