const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AssignUser,
  Teacher,
  StaffUser,
  Role,
  Department,
  RolePermission,
} = require("../models");

// Create Staff User
exports.createStaffUser = async (req, res) => {
  try {
    const { fullName, userName, password, responsiblity, phoneNumber } =
      req.body;

    const existingUser = await StaffUser.findOne({
      where: { userName },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffUser = await StaffUser.create({
      fullName,
      userName,
      password: hashedPassword,
      responsiblity,
      phoneNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Staff user created successfully",
      data: {
        id: staffUser.id,
        fullName: staffUser.fullName,
        userName: staffUser.userName,
        responsiblity: staffUser.responsiblity,
        phoneNumber: staffUser.phoneNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating staff user",
      error: error.message,
    });
  }
};

exports.staffLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await StaffUser.findOne({
      where: { userName },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Get assigned role and permissions
    const assignedUser = await AssignUser.findOne({
      where: {
        staffUserId: user.id,
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
        {
          model: Department,
          // as: "department",
          attributes: ["id", "name"]
        }
      ],
    });

    const role = assignedUser?.role || null;
    const department = assignedUser?.Department
  ? {
      id: assignedUser.Department.id,
      name: assignedUser.Department.name,
    }
  : null;

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

    // console.log(assignedUser.toJSON());

    // Create JWT with role and permissions
    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        userName: user.userName,
        role: role
          ? {
              id: role.id,
              name: role.name,
            }
          : null,
        department,
        permissions,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      // user: {
      //   id: user.id,
      //   fullName: user.fullName,
      //   userName: user.userName,
      //   responsiblity: user.responsiblity,
      // },
      // role: role
      //   ? {
      //       id: role.id,
      //       name: role.name,
      //     }
      //   : null,
      // permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get All Staff Users
exports.getStaffUsers = async (req, res) => {
  try {
    const staffUsers = await StaffUser.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: staffUsers.length,
      data: staffUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching staff users",
      error: error.message,
    });
  }
};

// Get Staff User By ID
exports.getStaffUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const staffUser = await StaffUser.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!staffUser) {
      return res.status(404).json({
        success: false,
        message: "Staff user not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: staffUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching staff user",
      error: error.message,
    });
  }
};

// Update Staff User
exports.updateStaffUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, userName, password, responsiblity } = req.body;

    const staffUser = await StaffUser.findByPk(id);

    if (!staffUser) {
      return res.status(404).json({
        success: false,
        message: "Staff user not found",
      });
    }

    if (userName && userName !== staffUser.userName) {
      const existingUser = await StaffUser.findOne({
        where: { userName },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    const updateData = {
      fullName,
      userName,
      responsiblity,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await staffUser.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Staff user updated successfully",
      data: {
        id: staffUser.id,
        fullName: staffUser.fullName,
        userName: staffUser.userName,
        responsiblity: staffUser.responsiblity,
        phoneNumber: staffUser.phoneNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating staff user",
      error: error.message,
    });
  }
};

// Delete Staff User
exports.deleteStaffUser = async (req, res) => {
  try {
    const { id } = req.params;

    const staffUser = await StaffUser.findByPk(id);

    if (!staffUser) {
      return res.status(404).json({
        success: false,
        message: "Staff user not found",
      });
    }

    await staffUser.destroy();

    return res.status(200).json({
      success: true,
      message: "Staff user deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting staff user",
      error: error.message,
    });
  }
};
