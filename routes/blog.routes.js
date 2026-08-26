const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const upload = require("../middleware/upload");
const { validate } = require('../middleware/validation');
const { createBlogSchema, updateBlogSchema, idParam } = require('../validations/blog.validation');

// List
router.get('/', blogController.getAllBlogs);

// Recent
router.get('/recent', blogController.getRecentBlogs);

// Create
router.post('/', upload("blogs").single('imageFile'), validate(createBlogSchema), blogController.createBlog);

// Read
router.get('/:id', validate(idParam), blogController.getBlogById);

// Update
router.put('/:id', upload("blogs").single('imageFile'), validate(updateBlogSchema), blogController.updateBlog);

// Delete
router.delete('/:id', validate(idParam), blogController.deleteBlog);

module.exports = router;
