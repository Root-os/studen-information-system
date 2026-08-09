const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const uploadBlog = require('../middleware/uploadBlog');
const { validate } = require('../middleware/validation');
const { createBlogSchema, updateBlogSchema, idParam } = require('../validations/blog.validation');

// List
router.get('/', blogController.getAllBlogs);

// Recent
router.get('/recent', blogController.getRecentBlogs);

// Create
router.post('/', uploadBlog.single('imageFile'), validate(createBlogSchema), blogController.createBlog);

// Read
router.get('/:id', validate(idParam), blogController.getBlogById);

// Update
router.put('/:id', uploadBlog.single('imageFile'), validate(updateBlogSchema), blogController.updateBlog);

// Delete
router.delete('/:id', validate(idParam), blogController.deleteBlog);

module.exports = router;
