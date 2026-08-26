const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { auth, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { updateUserSchema } = require("../validations/user.validation");
const upload = require("../middleware/upload");
// const {auth, authorise} = require('../middleware/auth');

router.post(
  "/register",
  upload("user").fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "familyPhoto", maxCount: 1 },
    { name: "otherDocument", maxCount: 1 },
  ]),
  userController.registerUser,
);

// /me routes require a valid JWT so req.user is populated
router.get("/me", auth, userController.getCurrentUser);
router.put(
  "/me",
  auth,
  upload.fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "familyPhoto", maxCount: 1 },
    { name: "otherDocument", maxCount: 1 },
  ]),
  validate(updateUserSchema),
  userController.updateCurrentUser,
);

router.get("/", userController.getAllUsers);
router.get("/filter", userController.getUsersByFilter);
router.get("/:id", userController.getUserById);
router.put(
  "/:id",
  upload.fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "familyPhoto", maxCount: 1 },
    { name: "otherDocument", maxCount: 1 },
  ]),
  userController.updateStudent,
);

// DELETE requires auth so req.user is available for the self-delete guard
router.delete("/:id", auth, userController.deleteUser);

module.exports = router;
