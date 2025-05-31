const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const login = async ({ body, ip, headers }) => {
  try {
    const { email, password } = body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return {
        status: 404,
        message: "User Not Found",
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { status: 400, message: "Invalid email or password" };
    }
    //access Token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    //Refresh Token
    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshTokens.push({
      token: refreshToken,
      userAgent: headers["user-agent"],
      ip: ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    return {
      status: 200,
      data: {
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          status: user.status,
          role: user.role,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Server Error",
    };
  }
};

const signup = async (params) => {
  try {
    const { email, password, role, parentId } = params;

    // 1️⃣ Validate role
    const allowedRoles = ["admin", "subadmin", "user"];
    if (!allowedRoles.includes(role)) {
      return { status: 400, message: "Invalid role specified" };
    }

    // 2️⃣ Validate parent-child hierarchy
    let parentUser = null;
    if (role === "admin") {
      if (parentId) {
        return { status: 400, message: "Admin cannot have a parent" };
      }
    } else {
      if (!parentId) {
        return { status: 400, message: `${role} must have a parentId` };
      }

      parentUser = await userModel.findById(parentId);
      if (!parentUser) {
        return { status: 400, message: "Parent user not found" };
      }

      if (role === "subadmin" && parentUser.role !== "admin") {
        return { status: 400, message: "Sub-admin must have an admin as parent" };
      }
      if (role === "user" && parentUser.role !== "subadmin") {
        return { status: 400, message: "User must have a sub-admin as parent" };
      }
    }

    // 3️⃣ Check if email already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return { status: 400, message: "Email already exists" };
    }

    // 4️⃣ Create user
    const newUser = new userModel({
      email,
      password,
      role,
      parentId: parentUser ? parentUser._id : null,
    });
    await newUser.save();

    // 5️⃣ Create JWT token
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return {
      status: 200,
      message: "Signup Successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    };
  } catch (error) {
    return {
      status: 500,
      message: "Server Error",
    };
  }
};
const refreshToken = async (params) => {
  try {
    const { refreshToken } = params;
    if (!refreshToken) {
      return {
        status: 400,
        message: "Refresh Token Required",
      };
    }

    // Convert jwt.verify into a Promise
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return {
        status: 400,
        message: "User not found",
      };
    }

    const tokenRecord = user.refreshTokens.find((rt) => rt.token === refreshToken);
    if (!tokenRecord) {
      return {
        status: 400,
        message: "Refresh token not recognized",
      };
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    return {
      status: 201,
      data: {
        accessToken: newAccessToken,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Server Error",
    };
  }
};
module.exports = { login, signup, refreshToken };
