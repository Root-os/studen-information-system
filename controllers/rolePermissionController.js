const { RolePermission, Role, Department } = require("../models");

// Create Role Permission
exports.createRolePermission = async (req, res) => {
  try {
    const { roleId, departmentId = null, permissions } = req.body;

    if (!roleId || !permissions) {
      return res.status(400).json({
        success: false,
        message: "roleId and permissions are required",
      });
    }

    // Validate Role
    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Validate Department
    if (departmentId) {
      const department = await Department.findByPk(departmentId);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
    }

    // Prevent duplicate assignment
    const exists = await RolePermission.findOne({
      where: {
        roleId,
        departmentId,
      },
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message:
          "Permissions already exist for this role and department.",
      });
    }

    const created = await RolePermission.create({
      roleId,
      departmentId,
      permissions,
    });

    return res.status(201).json({
      success: true,
      message: "Role permission created successfully.",
      data: created,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error creating role permission.",
      error: err.message,
    });
  }
};


// Get All Role Permissions
exports.getRolePermissions = async (req, res) => {
  try {
    const { roleId, departmentId } = req.query;

    const where = {};

    if (roleId) where.roleId = roleId;

    if (departmentId) where.departmentId = departmentId;

    const permissions = await RolePermission.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    const data = permissions.map((item) => ({
      id: item.id,

      role: item.role
        ? {
            id: item.role.id,
            name: item.role.name,
          }
        : null,

      department: item.department
        ? {
            id: item.department.id,
            name: item.department.name,
          }
        : null,

      permissions:
        typeof item.permissions === "string"
          ? JSON.parse(item.permissions)
          : item.permissions,

      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching permissions.",
      error: err.message,
    });
  }
};

// Get Role Permission By ID
exports.getRolePermissionById = async (req, res) => {
  try {
    const permission = await RolePermission.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching role permission.",
      error: err.message,
    });
  }
};

// Update Role Permission
exports.updateRolePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const { roleId, departmentId = null, permissions } = req.body;

    const permission = await RolePermission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found.",
      });
    }

    // Validate role
    if (roleId) {
      const role = await Role.findByPk(roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found.",
        });
      }
    }

    // Validate department
    if (departmentId) {
      const department = await Department.findByPk(departmentId);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found.",
        });
      }
    }

    // Prevent duplicate combination
    const duplicate = await RolePermission.findOne({
      where: {
        roleId: roleId ?? permission.roleId,
        departmentId: departmentId !== undefined ? departmentId : permission.departmentId,
      },
    });

    if (duplicate && duplicate.id !== permission.id) {
      return res.status(409).json({
        success: false,
        message:
          "Another permission record already exists for this role and department.",
      });
    }

    await permission.update({
      roleId: roleId ?? permission.roleId,
      departmentId,
      permissions: permissions ?? permission.permissions,
    });

    return res.status(200).json({
      success: true,
      message: "Role permission updated successfully.",
      data: permission,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating role permission.",
      error: err.message,
    });
  }
};

// Delete Role Permission
exports.deleteRolePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const rolePermission = await RolePermission.findByPk(id);

    if (!rolePermission) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found",
      });
    }

    await rolePermission.destroy();

    return res.status(200).json({
      success: true,
      message: "Role permission deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting role permission",
      error: error.message,
    });
  }
};