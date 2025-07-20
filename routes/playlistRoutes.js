const express = require("express");
const router = express.Router();
const playlistModel = require("../models/playlistModel");
const axios = require("axios");
const { isAuthenticated } = require("../middleware/authMiddleware");

// View all playlists
router.get("/playlists", isAuthenticated, async (req, res) => {
  const playlists = await playlistModel.find({ user: req.user._id });
  res.render("playlists", { playlists, user: req.user });
});

// Create new playlist
router.get("/playlist/new", isAuthenticated, (req, res) => {
  res.render("createPlaylist");
});

router.post("/create-playlist", isAuthenticated, async (req, res) => {
  const { name } = req.body;
  await playlistModel.create({ name, songs: [], user: req.user._id });
  res.redirect("/playlists");
});

// View single playlist
router.get("/playlist/:id", isAuthenticated, async (req, res) => {
  const playlist = await playlistModel.findOne({ _id: req.params.id, user: req.user._id });
  if (!playlist) return res.status(403).send("Unauthorized or Playlist not found");
  res.render("readPlaylist", { playlist });
});

// Add song to playlist
router.post("/playlist/:id/add-song", isAuthenticated, async (req, res) => {
  const playlist = await playlistModel.findOne({ _id: req.params.id, user: req.user._id });
  if (!playlist) return res.status(403).send("Unauthorized");

  const { url } = req.body;
  try {
    const { data } = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
    playlist.songs.push({ title: data.title, url });
    await playlist.save();
    res.redirect(`/playlist/${playlist._id}`);
  } catch (err) {
    res.status(400).send("Invalid URL");
  }
});

// Delete song from playlist
router.get("/playlist/:playlistId/deletesong/:songIndex", isAuthenticated, async (req, res) => {
  const playlist = await playlistModel.findOne({ _id: req.params.playlistId, user: req.user._id });
  if (!playlist || req.params.songIndex >= playlist.songs.length) {
    return res.send("Song not found or Unauthorized");
  }
  playlist.songs.splice(req.params.songIndex, 1);
  await playlist.save();
  res.redirect(`/playlist/${playlist._id}`);
});
// Show Edit Form
router.get('/playlist/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const playlist = await playlistModel.findOne({ _id: req.params.id, user: req.user._id });
    if (!playlist) return res.status(403).send("Unauthorized or Playlist not found");
    res.render('editPlaylist', { playlist });
  } catch (err) {
    res.status(500).send("Error loading edit form");
  }
});

// Update Playlist
router.put('/playlist/:id', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    await playlistModel.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { name });
    res.redirect('/playlists');
  } catch (err) {
    res.status(500).send("Error updating playlist");
  }
});

// Delete Playlist
router.delete('/playlist/:id', isAuthenticated, async (req, res) => {
  try {
    await playlistModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.redirect('/playlists');
  } catch (err) {
    res.status(500).send("Error deleting playlist");
  }
});




module.exports = router;
