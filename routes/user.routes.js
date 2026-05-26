const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { updateUserSchema } = require('../validations/user.validation');
const upload = require('../middleware/upload');
// const {auth, authorise} = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', userController.getCurrentUser);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/me',
      upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'familyPhoto', maxCount: 1 }
  ]), validate(updateUserSchema), userController.updateCurrentUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, TEACHER, STUDENT]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', authorize('ADMIN'), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/filter', userController.getUsersByFilter);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.put('/:id',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'familyPhoto', maxCount: 1 }
  ]),
  userController.updateStudent
);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);


module.exports = router;
