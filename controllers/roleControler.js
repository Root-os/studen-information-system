const Role = require("../models/Role");

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingRole = await Role.findOne({ where: { name } });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      });
    }

    const role = await Role.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating role",
      error: error.message,
    });
  }
};

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching roles",
      error: error.message,
    });
  }
};

// Get Role By ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching role",
      error: error.message,
    });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        where: { name },
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        });
      }
    }

    await role.update({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message,
    });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await role.destroy();

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting role",
      error: error.message,
    });
  }
};