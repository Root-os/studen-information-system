const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Teacher, Role, RolePermission } = require("../models");

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { fullName, phone, userName, password, roleId } = req.body;

    const existingUser = await Teacher.findOne({
      where: { userName },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Resolve roleId: use provided one, or find/create the TEACHER role
    let resolvedRoleId = roleId || null;

    if (!resolvedRoleId) {
      const [teacherRole] = await Role.findOrCreate({
        where: { name: { [Op.like]: "teacher" } },
        defaults: { name: "TEACHER", description: "Teacher" },
      });
      resolvedRoleId = teacherRole.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      fullName,
      phone,
      userName,
      password: hashedPassword,
      roleId: resolvedRoleId,
    });

    const teacherWithRole = await Teacher.findByPk(teacher.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Role, as: "role" }],
    });

    res.status(201).json({
      message: "Teacher created successfully",
      data: teacherWithRole,
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
      include: [{ model: Role, as: "role" }],
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
      include: [{ model: Role, as: "role" }],
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
    const { fullName, phone, userName, roleId } = req.body;

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
      ...(roleId !== undefined && { roleId }),
    });

    const updatedTeacher = await Teacher.findByPk(teacher.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Role, as: "role" }],
    });

    res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
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

    if (!teacher) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const role = teacher.role || null;

    const rawPermissions =
      role?.rolePermissions?.[0]?.permissions || {};

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
        fullName: teacher.fullName,
        userName: teacher.userName,
        role: role
          ? {
              id: role.id,
              name: role.name,
            }
          : null,
        permissions,
      },
      process.env.JWT_SECRET || "secretkey",
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