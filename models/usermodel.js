const mongoose = require("mongoose");
const bcrypt = require("bcrypt");



const songSchema = new mongoose.Schema({
  title: String,
  url: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
  songs: [songSchema]
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
