const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { validate } = require('../middleware/validation');
const { createBlogSchema, updateBlogSchema, idParam } = require('../validations/blog.validation');

// List
router.get('/', blogController.getAllBlogs);

// Recent
router.get('/recent', blogController.getRecentBlogs);

// Create
router.post('/', validate(createBlogSchema), blogController.createBlog);

// Read
router.get('/:id', validate(idParam), blogController.getBlogById);

// Update
router.put('/:id', validate(updateBlogSchema), blogController.updateBlog);

// Delete
router.delete('/:id', validate(idParam), blogController.deleteBlog);

module.exports = router;
