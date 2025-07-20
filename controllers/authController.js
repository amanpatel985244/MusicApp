const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

exports.getLogin = (req, res) => res.render("login");
exports.getRegister = (req, res) => res.render("register");

exports.register = async (req, res) => {
  const { name, email, password, imageUrl } = req.body;
  const existing = await userModel.findOne({ email });
  if (existing) return res.send("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({ name, email, password: hashedPassword, image: imageUrl, songs: [] });
  await user.save();

  res.cookie("userId", user._id, { httpOnly: true });
  res.redirect("/playlists");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.send("User not found");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.send("Incorrect password");

  res.cookie("userId", user._id, { httpOnly: true });
  res.redirect("/playlists");
};

exports.logout = (req, res) => {
  res.clearCookie("userId");
  res.redirect("/");
};
