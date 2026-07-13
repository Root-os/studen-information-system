const Class = require("../models/class");

exports.createClass = async (req, res) => {
  try {
    const { className, description, isActive } = req.body;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: "Class name is required.",
      });
    }

    const existing = await Class.findOne({
      where: { className },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Class already exists.",
      });
    }

    const newClass = await Class.create({
      className,
      description,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: newClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [["className", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, description, isActive } = req.body;

    const classData = await Class.findByPk(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    if (className && className !== classData.className) {
      const existing = await Class.findOne({
        where: { className },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Class name already exists.",
        });
      }
    }

    await classData.update({
      className,
      description,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Class updated successfully.",
      data: classData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    await classData.destroy();

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Cannot delete class because it is being used by other records.",
    });
  }
};