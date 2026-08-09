const { Blog, sequelize } = require('../models');

// Helper to construct full URL for image and convert webpage links to direct image streams
function formatImageUrl(req, imagePath) {
  if (!imagePath) return null;
  let str = String(imagePath).trim();

  // Auto-convert Unsplash webpage page URLs (e.g. https://unsplash.com/photos/slug-id) to direct image stream
  if (str.includes('unsplash.com/photos/')) {
    const slug = str.split('unsplash.com/photos/')[1]?.split('?')[0]?.split('/')[0];
    if (slug) {
      const parts = slug.split('-');
      const photoId = parts[parts.length - 1];
      if (photoId) {
        return `https://unsplash.com/photos/${photoId}/download?w=1000`;
      }
    }
  }

  // Auto-convert Imgur webpage page URLs (e.g. https://imgur.com/id -> https://i.imgur.com/id.jpg)
  if (str.includes('imgur.com/') && !str.includes('i.imgur.com/')) {
    const id = str.split('imgur.com/')[1]?.split('?')[0]?.split('/')[0];
    if (id && !id.includes('.')) {
      return `https://i.imgur.com/${id}.jpg`;
    }
  }

  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  const cleanPath = str.startsWith('/') ? str : `/${str}`;
  return `${protocol}://${host}${cleanPath}`;
}

function formatBlogRecord(req, blog) {
  if (!blog) return null;
  const json = blog.toJSON ? blog.toJSON() : { ...blog };
  json.image = formatImageUrl(req, json.image);
  return json;
}

// Create blog post
exports.createBlog = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { blogDetail, date } = req.body;
    let image = req.body.image ? String(req.body.image).trim() : null;

    if (req.file) {
      image = `/uploads/blogs/${req.file.filename}`;
    }

    if (!blogDetail || !date) {
      await transaction.rollback();
      return res.status(400).json({ message: 'blogDetail and date are required' });
    }

    const item = await Blog.create({ blogDetail, date, image }, { transaction });
    await transaction.commit();
    res.status(201).json(formatBlogRecord(req, item));
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
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });
    const items = rows.map((r) => formatBlogRecord(req, r));
    res.status(200).json({ total: count, page, limit, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get blog by id
exports.getBlogById = async (req, res) => {
  try {
    const item = await Blog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(formatBlogRecord(req, item));
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

    const { blogDetail, date } = req.body;
    let image = req.body.image !== undefined ? (req.body.image ? String(req.body.image).trim() : null) : item.image;

    if (req.file) {
      image = `/uploads/blogs/${req.file.filename}`;
    }

    await item.update({
      ...(blogDetail && { blogDetail }),
      ...(date && { date }),
      image,
    }, { transaction });

    await transaction.commit();
    res.status(200).json(formatBlogRecord(req, item));
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
    const rows = await Blog.findAll({ order: [['date', 'DESC'], ['createdAt', 'DESC']], limit });
    const items = rows.map((r) => formatBlogRecord(req, r));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
