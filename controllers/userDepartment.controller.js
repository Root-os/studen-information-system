const { UserDepartment, User, Department } = require("../models/exportModels");

/**
 * Assign User to Department
 */
exports.assignUserToDepartment = async (req, res) => {
  try {
    const { userId, departmentId, role } = req.body;

    const assignment = await UserDepartment.create({
      userId,
      departmentId,
      role
    });

    res.status(201).json({
      message: "User assigned to department",
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Assignments
 */
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await UserDepartment.findAll({
      include: [
        { model: User, attributes: ["id", "fullName", "email"] },
        { model: Department, attributes: ["id", "name"] }
      ]
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Users in a Department
 */
exports.getDepartmentUsers = async (req, res) => {
  try {
    const users = await UserDepartment.findAll({
      where: { departmentId: req.params.departmentId },
      include: [
        { model: User, attributes: ["id", "fullName", "email"] }
      ]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Departments of a User
 */
exports.getUserDepartments = async (req, res) => {
  try {
    const departments = await UserDepartment.findAll({
      where: { userId: req.params.userId },
      include: [
        { model: Department, attributes: ["id", "name"] }
      ]
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove User from Department
 */
exports.removeUserFromDepartment = async (req, res) => {
  try {
    const assignment = await UserDepartment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    await assignment.destroy();

    res.json({ message: "User removed from department" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};