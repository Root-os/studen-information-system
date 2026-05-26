const { Department, UserDepartment, User } = require("../models/exportModels");

/**
 * Create Department
 */
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = await Department.create({
      name,
      description
    });

    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Departments
 */
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Department by ID
 */
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update Department
 */
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.update({ name, description });

    res.json({
      message: "Department updated successfully",
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Department
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.destroy();

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};