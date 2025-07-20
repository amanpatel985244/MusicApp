const userModel = require("../models/userModel");

const getCurrentUser = async (req, res, next) => {
  const userId = req.cookies.userId;
  if (userId) {
    const user = await userModel.findById(userId);
    if (user) req.user = user;
  }
  next();
};

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.redirect("/");
  next();
};

module.exports = { getCurrentUser, isAuthenticated };
