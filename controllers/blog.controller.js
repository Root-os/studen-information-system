const { Blog, sequelize } = require('../models');

// Create blog post
exports.createBlog = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { blogDetail, date, image } = req.body;
    if (!blogDetail || !date) {
      await transaction.rollback();
      return res.status(400).json({ message: 'blogDetail and date are required' });
    }

    const item = await Blog.create({ blogDetail, date, image }, { transaction });
    await transaction.commit();
    res.status(201).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// List blogs with pagination
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { count, rows } = await Blog.findAndCountAll({
      order: [['date', 'DESC']],
      limit,
      offset
    });
    res.status(200).json({ total: count, page, limit, items: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get blog by id
exports.getBlogById = async (req, res) => {
  try {
    const item = await Blog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Blog.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { blogDetail, date, image } = req.body;
    await item.update({ blogDetail, date, image }, { transaction });
    await transaction.commit();
    res.status(200).json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Blog.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Blog not found' });
    }

    await item.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Recent blogs
exports.getRecentBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    const items = await Blog.findAll({ order: [['date', 'DESC']], limit });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
