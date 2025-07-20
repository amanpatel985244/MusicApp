const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const userModel = require("../models/userModel");
const axios = require("axios");
const bcrypt = require("bcrypt");

// Profile view
router.get("/me", isAuthenticated, (req, res) => {
  res.render("readUsers", { user: req.user });
});

// Edit profile
router.get("/edit", isAuthenticated, (req, res) => {
  res.render("edit", { updateuser: req.user });
});

// Update user
router.post("/update", isAuthenticated, async (req, res) => {
  const { id, name, email, password, imageUrl } = req.body;
  const updateData = { name, email, image: imageUrl };
  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }
  await userModel.findByIdAndUpdate(id, updateData);
  res.redirect("/playlists");
});

// Add song
router.get("/addsong/:id", isAuthenticated, (req, res) => {
  res.render("addsong", { userId: req.params.id });
});

router.post("/addsong/:id", isAuthenticated, async (req, res) => {
  const { url } = req.body;
  try {
    const { data } = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
    const title = data.title;
    await userModel.findByIdAndUpdate(req.params.id, {
      $push: { songs: { title, url } },
    });
    res.redirect("/me");
  } catch (err) {
    res.status(400).send("Invalid YouTube URL");
  }
});

// Delete song
router.get("/deletesong/:userId/:songIndex", isAuthenticated, async (req, res) => {
  const { userId, songIndex } = req.params;
  const user = await userModel.findById(userId);
  if (!user || songIndex >= user.songs.length) return res.send("Song not found");
  user.songs.splice(songIndex, 1);
  await user.save();
  res.redirect("/me");
});

module.exports = router;
