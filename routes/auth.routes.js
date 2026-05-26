const express = require('express');
const router = express.Router();
// const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
// const { validate } = require('../middleware/validation');
// const { loginSchema, registerSchema } = require('../validations/auth.validation');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register',   upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'familyPhoto', maxCount: 1 },
    { name: 'otherDocument', maxCount: 5}
  ]),  
  userController.registerUser);

router.post('/login', userController.loginUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
// router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
// router.post('/refresh-token', authController.refreshToken);

module.exports = router;
