const Management = require("../models/management");
const User = require("../models/user");

// Create a new management role
exports.createManagement = async (req, res) => {
  try {
    const { userId, assignedRole, description, active } = req.body;

    if (!userId || !assignedRole) {
      return res.status(400).json({ message: "userId and assignedRole are required" });
    }

    // Optional: verify the user exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const management = await Management.create({
      userId,
      assignedRole,
      description,
      active: active !== undefined ? active : true,
    });

    res.status(201).json({ message: "Role assigned successfully", management });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all management roles
exports.getAllManagement = async (req, res) => {
  try {
    const roles = await Management.findAll({
      include: [{ model: User, attributes: ["id", "fullName", "email"] }],
    });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get management roles by userId
exports.getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const roles = await Management.findAll({
      where: { userId },
      include: [{ model: User, attributes: ["id", "fullName", "email"] }],
    });

    if (!roles.length) return res.status(404).json({ message: "No roles found for this user" });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a management role
exports.updateManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedRole, description, active } = req.body;

    const role = await Management.findByPk(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await role.update({ assignedRole, description, active });

    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a management role
exports.deleteManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Management.findByPk(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await role.destroy();
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};