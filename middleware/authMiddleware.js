// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model"); // Adjust the path as needed

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: 401, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.find({ _id: decoded.id }).select("-password -refreshTokens"); // remove password

    if (!user) {
      return res.status(401).json({ status: 401, message: "Unauthorized: User not found" });
    }

    req.user = user[0]; // Attach user to request object
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ status: 401, message: "Unauthorized: Invalid token" });
  }
};

const roleChecker = async (req, res, next) => {
  try {
    let roleQuery = "";

    switch (req.user.role) {
      case "admin":
        roleQuery = "user,subadmin";
        break;
      case "subadmin":
        roleQuery = "admin";
        break;
      case "user":
        roleQuery = "subadmin";
        break;
      default:
        roleQuery = "user";
    }
  } catch (error) {
    return res.status(401).json({ status: 401, message: "Unauthorized: Invalid token" });
  }
};
module.exports = { authMiddleware, roleChecker };
