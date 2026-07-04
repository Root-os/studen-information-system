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

router.get('/me', userController.getCurrentUser);
router.put('/me',
      upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'familyPhoto', maxCount: 1 }
  ]), validate(updateUserSchema), userController.updateCurrentUser);
router.get('/', authorize('ADMIN'), userController.getAllUsers);
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
