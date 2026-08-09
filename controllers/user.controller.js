const { User, Role, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const generateStudentId = require("../helpers/idGenerate");

exports.registerUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      fullName,
      date_of_birth,
      email,
      password,
      roleId,
      category,
      generateId,
      ...otherFields
    } = req.body;

    if (!fullName || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentPhoto = req.files?.studentPhoto
      ? req.files.studentPhoto[0].filename
      : null;

    const familyPhoto = req.files?.familyPhoto
      ? req.files.familyPhoto[0].filename
      : null;

    const otherDocument = req.files?.otherDocument
      ? req.files.otherDocument[0].filename
      : null;

    let studentId = null;

    if (generateId === "apply") {
      studentId = await generateStudentId();
    }

    const user = await User.create(
      {
        ...otherFields,
        fullName,
        date_of_birth,
        email,
        password: hashedPassword,
        roleId: roleId,
        category: category || "student",
        studentId,
        studentPhoto,
        familyPhoto,
        otherDocument,
      },
      { transaction },
    );

    await transaction.commit();

    const { password: pwd, ...userData } = user.get({ plain: true });

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { roleId } = req.query;
    const whereClause = roleId ? { roleId } : {};

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      include: [{ model: Role, attributes: ["id", "name"] }],
    });

    const baseUrl = process.env.baseUrl;

    const usersWithFullUrls = users.map((user) => {
      const u = user.get({ plain: true });

      if (u.studentPhoto) {
        u.studentPhoto = `${baseUrl}/uploads/user/${u.studentPhoto}`;
      }
      if (u.familyPhoto) {
        u.familyPhoto = `${baseUrl}/uploads/user/${u.familyPhoto}`;
      }
      if (u.otherDocument) {
        u.otherDocument = `${baseUrl}/uploads/user/${u.otherDocument}`;
      }

      return u;
    });

    res.status(200).json(usersWithFullUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user's profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Role, attributes: ["name"] }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseUrl = process.env.baseUrl;

    const u = user.get({ plain: true });

    if (u.studentPhoto) {
      u.studentPhoto = `${baseUrl}/uploads/user/${u.studentPhoto}`;
    }

    if (u.familyPhoto) {
      u.familyPhoto = `${baseUrl}/uploads/user/${u.familyPhoto}`;
    }
    if (u.otherDocument) {
      u.otherDocument = `${baseUrl}/uploads/user/${u.otherDocument}`;
    }

    res.status(200).json(u);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await User.findByPk(req.params.id, { transaction });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ message: "Student not found" });
    }

    // Only allow updating STUDENT role
    // if (student.role !== "STUDENT") {
    //   await transaction.rollback();
    //   return res
    //     .status(400)
    //     .json({ message: "Cannot update non-student user" });
    // }

    // Handle generateId flag
    let studentId = student.studentId; // existing ID
    const { generateId } = req.body;

    if (generateId === "apply" && !studentId) {
      studentId = await generateStudentId();
    }

    // Remove generateId from body so it doesn't get saved
    delete req.body.generateId;

    // Handle file uploads
    let studentPhoto = student.studentPhoto;
    let familyPhoto = student.familyPhoto;
    let otherDocument = student.otherDocument;

    if (req.files?.studentPhoto) {
      if (studentPhoto)
        fs.existsSync(path.join("uploads/user", studentPhoto)) &&
          fs.unlinkSync(path.join("uploads/user", studentPhoto));
      studentPhoto = req.files.studentPhoto[0].filename;
    }

    if (req.files?.familyPhoto) {
      if (familyPhoto)
        fs.existsSync(path.join("uploads/user", familyPhoto)) &&
          fs.unlinkSync(path.join("uploads/user", familyPhoto));
      familyPhoto = req.files.familyPhoto[0].filename;
    }

    if (req.files?.otherDocument) {
      if (otherDocument)
        fs.existsSync(path.join("uploads/user", otherDocument)) &&
          fs.unlinkSync(path.join("uploads/user", otherDocument));
      otherDocument = req.files.otherDocument[0].filename;
    }

    // Optional password update
    let hashedPassword = student.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    // Update student
    await student.update(
      {
        ...req.body,
        password: hashedPassword,
        studentPhoto,
        familyPhoto,
        otherDocument,
        studentId,
      },
      { transaction },
    );

    await transaction.commit();

    const { password, ...studentData } = student.get({ plain: true });
    res
      .status(200)
      .json({ message: "Student updated successfully", student: studentData });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update current user's profile
exports.updateCurrentUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.user.id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Handle email update
    const { email, fullName, phone } = req.body;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: user.id } },
        transaction,
      });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Handle file uploads
    let studentPhoto = user.studentPhoto;
    let familyPhoto = user.familyPhoto;

    if (req.files?.studentPhoto) {
      // Delete old photo
      if (studentPhoto) {
        const oldPath = path.join("uploads/user", studentPhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      studentPhoto = req.files.studentPhoto[0].filename;
    }

    if (req.files?.familyPhoto) {
      if (familyPhoto) {
        const oldPath = path.join("uploads/user", familyPhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      familyPhoto = req.files.familyPhoto[0].filename;
    }

    // Optional password update
    let hashedPassword = user.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    // Update user
    await user.update(
      {
        ...req.body,
        password: hashedPassword,
        studentPhoto,
        familyPhoto,
      },
      { transaction },
    );

    await transaction.commit();

    const { password, ...userData } = user.get({ plain: true });
    res.status(200).json(userData);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.params.id, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Safe check
    if (req.user && user.id === req.user.id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await user.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId,
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" },
    );

    const { password: pwd, ...userData } = user.get({ plain: true });

    res.status(200).json({
      message: "Login successful",
      token,
      // user: userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByFilter = async (req, res) => {
  try {
    const { status, category, role } = req.query;

    // Build dynamic WHERE clause based on query params
    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (role) whereClause.role = role;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
    });

    const baseUrl = process.env.baseUrl;

    const usersWithFullUrls = users.map((user) => {
      const u = user.get({ plain: true });

      if (u.studentPhoto)
        u.studentPhoto = `${baseUrl}/uploads/user/${u.studentPhoto}`;
      if (u.familyPhoto)
        u.familyPhoto = `${baseUrl}/uploads/user/${u.familyPhoto}`;
      if (u.otherDocument)
        u.otherDocument = `${baseUrl}/uploads/user/${u.otherDocument}`;

      return u;
    });

    res.status(200).json(usersWithFullUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
