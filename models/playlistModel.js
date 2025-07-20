// models/playlistModel.js
const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  name: String,
  songs: [{ title: String, url: String }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Playlist", playlistSchema);
