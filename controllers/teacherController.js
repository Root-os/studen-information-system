const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Teacher, AssignUser, Role, RolePermission } = require("../models");

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { fullName, phone, userName, password } = req.body;

    const existingUser = await Teacher.findOne({
      where: { userName },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      fullName,
      phone,
      userName,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Teacher By ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { fullName, phone, userName } = req.body;

    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    await teacher.update({
      fullName,
      phone,
      userName,
    });

    res.status(200).json({
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    await teacher.destroy();

    res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.loginTeacher = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const teacher = await Teacher.findOne({
      where: { userName },
    });

    if (!teacher) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Get assigned role and permissions
    const assignedUser = await AssignUser.findOne({
      where: {
        teacherId: teacher.id,
        isActive: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          include: [
            {
              model: RolePermission,
              as: "rolePermissions",
            },
          ],
        },
      ],
    });

    const role = assignedUser?.role || null;

    const rawPermissions =
      assignedUser?.role?.rolePermissions?.[0]?.permissions || {};

    let permissions = {};

    try {
      permissions =
        typeof rawPermissions === "string"
          ? JSON.parse(rawPermissions)
          : rawPermissions;
    } catch (err) {
      permissions = {};
    }

    const token = jwt.sign(
      {
        id: teacher.id,
        userName: teacher.userName,
        role: role
          ? {
              id: role.id,
              name: role.name,
            }
          : null,
        permissions,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        userName: teacher.userName,
        phone: teacher.phone,
      },
      role: role
        ? {
            id: role.id,
            name: role.name,
          }
        : null,
      permissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};