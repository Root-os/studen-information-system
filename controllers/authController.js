const {User, StaffUser, Teacher} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
  try {
    const { identifier, password, type } = req.body;

    if (!identifier || !password || !type) {
      return res.status(400).json({
        message: "Identifier, password, and type are required",
      });
    }

    let account = null;

    // 1. Find user based on type
    if (type === "user") {
      account = await User.findOne({
        where: { email: identifier },
      });
    }

    if (type === "teacher") {
      account = await Teacher.findOne({
        where: { userName: identifier },
      });
    }

    if (type === "staff") {
      account = await StaffUser.findOne({
        where: { userName: identifier },
      });
    }

    if (!account) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 3. Create unified token
    const token = jwt.sign(
      {
        id: account.id,
        type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Return unified response
    return res.json({
      token,
      type,
      user: {
        id: account.id,
        name: account.fullName || account.userName,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};