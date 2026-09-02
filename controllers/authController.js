const { User, Role } = require("../models");
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

    // Find account by email (include Role so we can embed it in the JWT)
    const account = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          // as: "role",
          attributes: ["id", "name"],
        },
      ],
    });

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

    // Generate JWT — embed role as an object { id, name } so the UI's
    // isSuperAdmin() check (user?.role?.name === "Super Admin") works correctly
    // after jwtDecode(token) is stored as the user in AuthContext.
    const token = jwt.sign(
      {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role
          ? { id: account.role.id, name: account.role.name }
          : null,
      },
      process.env.JWT_SECRET || "secretkey",
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
