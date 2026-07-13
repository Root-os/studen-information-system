const { User, StaffUser, Teacher, Role } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find account by email
    let account = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          // as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

    // If not found in User, check Admin (optional)
    if (!account) {
      account = await Admin.findOne({ email });
    }

    if (!account) {
      return res.status(404).json({
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: account.id,
        email: account.email,
        roleId: account.roleId,
        role: account.role?.name,
        fullName: account.fullName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      // user: {
      //   id: account._id,
      //   name: account.name,
      //   email: account.email,
      //   role: account.role,
      // },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
