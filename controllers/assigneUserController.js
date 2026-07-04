const {
  AssignUser,
  Teacher,
  StaffUser,
  Role,
  Department,
} = require("../models");

exports.createAssignUser = async (req, res) => {
  try {
    const { teacherId, staffUserId, departmentId, roleId, isActive } = req.body;

    // At least one is required
    if ((!teacherId && !staffUserId) || (teacherId && staffUserId)) {
      return res.status(400).json({
        message: "Provide either teacherId or staffUserId, but not both",
      });
    }

    if (teacherId) {
      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({
          message: "Teacher not found",
        });
      }
    }

    if (staffUserId) {
      const staffUser = await StaffUser.findByPk(staffUserId);
      if (!staffUser) {
        return res.status(404).json({
          message: "Staff user not found",
        });
      }
    }

    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json({
          message: "Role not found",
        });
      }
    }

    if(departmentId) {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }
    }

    const assignUser = await AssignUser.create({
      teacherId,
      staffUserId,
      departmentId,
      roleId,
      isActive,
    });

    return res.status(201).json({
      message: "User assigned successfully",
      data: assignUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllAssignUsers = async (req, res) => {
  try {
    const assignUsers = await AssignUser.findAll({
      include: [
        { model: Teacher, attributes: ["id", "fullName"] },
        { model: StaffUser, attributes: ["id", "fullName"] },
        { model: Role, attributes: ["id", "name"] },
        { model: Department, attributes: ["id", "name"] }
      ],},
    );

    return res.status(200).json(assignUsers);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAssignUserById = async (req, res) => {
  try {
    const assignUser = await AssignUser.findByPk(req.params.id);

    if (!assignUser) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json(assignUser);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateAssignUser = async (req, res) => {
  try {
    const assignUser = await AssignUser.findByPk(req.params.id);

    if (!assignUser) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const { teacherId, staffUserId, departmentId, roleId, isActive } = req.body;

    if (!teacherId && !staffUserId) {
      return res.status(400).json({
        message: "Either teacherId or staffUserId is required",
      });
    }

    await assignUser.update({
      teacherId,
      staffUserId,
      departmentId,
      roleId,
      isActive,
    });

    return res.status(200).json({
      message: "Assignment updated successfully",
      data: assignUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteAssignUser = async (req, res) => {
  try {
    const assignUser = await AssignUser.findByPk(req.params.id);

    if (!assignUser) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    await assignUser.destroy();

    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
