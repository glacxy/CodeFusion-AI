const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized, token invalid",
    });
  }
};

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Not authorized"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new Error("Not authorized"));
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("Not authorized"));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, authenticateSocket };
