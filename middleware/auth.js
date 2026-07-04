const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // Attach user info to request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission"
      });
    }

    next();
  };
};

exports.checkPermission = (module, action = "view") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Super Admin bypasses everything
    if (req.user?.role?.name === "Super Admin") {
      return next();
    }

    const allowed = req.user?.permissions?.[module]?.[action];
    if (!allowed) {
      return res.status(403).json({
        message: `Access denied: missing '${action}' permission for '${module}'`,
      });
    }

    next();
  };
};
