// const express = require("express");
// const path = require("path");
// const axios = require("axios");
// const cookieParser = require("cookie-parser");
// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");
// const userModel = require("./models/usermodel");
// const playlistModel = require("./models/playlistModel");
// const { spawn } = require("child_process");

// const app = express();
// mongoose.connect("mongodb+srv://amansingh91027:Aman%401568@clusterblog.acxvsjy.mongodb.net/musicApp");

// app.set("view engine", "ejs");
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// // Middleware to attach current user from cookie
// const getCurrentUser = async (req, res, next) => {
//   const userId = req.cookies.userId;
//   if (userId) {
//     const user = await userModel.findById(userId);
//     if (user) req.user = user;
//   }
//   next();
// };
// app.use(getCurrentUser);

// // Auth guard middleware
// const isAuthenticated = (req, res, next) => {
//   if (!req.user) return res.redirect("/");
//   next();
// };

// // === AUTH ===
// app.get("/", (req, res) => res.render("login"));
// app.get("/register", (req, res) => res.render("register"));

// app.post("/register", async (req, res) => {
//   const { name, email, password, imageUrl } = req.body;
//   const existing = await userModel.findOne({ email });
//   if (existing) return res.send("User already exists");

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = new userModel({
//     name,
//     email,
//     password: hashedPassword,
//     image: imageUrl,
//     songs: [],
//   });

//   await user.save();

//   // ✅ Auto-login after registration
//   res.cookie("userId", user._id, { httpOnly: true });
//   res.redirect("/playlists");
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await userModel.findOne({ email });
//   if (!user) return res.send("User not found");

//   const isMatch = await user.comparePassword(password);
//   if (!isMatch) return res.send("Incorrect password");

//   res.cookie("userId", user._id, { httpOnly: true });
//   res.redirect("/playlists");
// });

// app.get("/logout", (req, res) => {
//   res.clearCookie("userId");
//   res.redirect("/");
// });

// // === USER PROFILE ===
// app.get("/me", isAuthenticated, (req, res) => {
//   res.render("readUsers", { user: req.user });
// });

// app.get("/edit", isAuthenticated, (req, res) => {
//   res.render("edit", { updateuser: req.user });
// });

// app.post("/update", isAuthenticated, async (req, res) => {
//   const { id, name, email, password, imageUrl } = req.body;
//   const updateData = { name, email, image: imageUrl };
//   if (password && password.trim() !== "") {
//     updateData.password = await bcrypt.hash(password, 10);
//   }
//   await userModel.findByIdAndUpdate(id, updateData);
//   res.redirect("/playlists");
// });

// // === USER SONGS ===
// app.get("/addsong/:id", isAuthenticated, (req, res) => {
//   res.render("addsong", { userId: req.params.id });
// });

// app.post("/addsong/:id", isAuthenticated, async (req, res) => {
//   const { url } = req.body;
//   try {
//     const { data } = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
//     const title = data.title;
//     await userModel.findByIdAndUpdate(req.params.id, {
//       $push: { songs: { title, url } },
//     });
//     res.redirect("/me");
//   } catch (err) {
//     res.status(400).send("Invalid YouTube URL");
//   }
// });

// app.get("/deletesong/:userId/:songIndex", isAuthenticated, async (req, res) => {
//   const { userId, songIndex } = req.params;
//   const user = await userModel.findById(userId);
//   if (!user || songIndex >= user.songs.length) return res.send("Song not found");
//   user.songs.splice(songIndex, 1);
//   await user.save();
//   res.redirect("/me");
// });

// // === PLAYLIST ROUTES (User-Specific) ===
// app.get("/playlists", isAuthenticated, async (req, res) => {
//   const playlists = await playlistModel.find({ user: req.user._id });
//   res.render("playlists", { playlists, user: req.user });
// });

// app.get("/playlist/new", isAuthenticated, (req, res) => {
//   res.render("createPlaylist");
// });

// app.post("/create-playlist", isAuthenticated, async (req, res) => {
//   const { name } = req.body;
//   await playlistModel.create({
//     name,
//     songs: [],
//     user: req.user._id,
//   });
//   res.redirect("/playlists");
// });

// app.get("/playlist/:id", isAuthenticated, async (req, res) => {
//   const playlist = await playlistModel.findOne({ _id: req.params.id, user: req.user._id });
//   if (!playlist) return res.status(403).send("Unauthorized or Playlist not found");
//   res.render("readPlaylist", { playlist });
// });

// app.post("/playlist/:id/add-song", isAuthenticated, async (req, res) => {
//   const playlist = await playlistModel.findOne({ _id: req.params.id, user: req.user._id });
//   if (!playlist) return res.status(403).send("Unauthorized");

//   const { url } = req.body;
//   try {
//     const { data } = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
//     playlist.songs.push({ title: data.title, url });
//     await playlist.save();
//     res.redirect(`/playlist/${playlist._id}`);
//   } catch (err) {
//     res.status(400).send("Invalid URL");
//   }
// });

// app.get("/playlist/:playlistId/deletesong/:songIndex", isAuthenticated, async (req, res) => {
//   const playlist = await playlistModel.findOne({ _id: req.params.playlistId, user: req.user._id });
//   if (!playlist || req.params.songIndex >= playlist.songs.length) {
//     return res.send("Song not found or Unauthorized");
//   }
//   playlist.songs.splice(req.params.songIndex, 1);
//   await playlist.save();
//   res.redirect(`/playlist/${playlist._id}`);
// });

// // === STREAM AUDIO (yt-dlp backend route) ===
// app.get("/stream-audio", async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) return res.status(400).send("No URL provided");

//   res.set({
//     "Content-Type": "audio/mpeg",
//     "Transfer-Encoding": "chunked",
//   });

//   const ytdlp = spawn("yt-dlp", ["-f", "bestaudio", "-o", "-", videoUrl]);
//   ytdlp.stdout.pipe(res);
//   ytdlp.stderr.on("data", (data) => console.error(`yt-dlp error: ${data}`));
//   ytdlp.on("close", () => res.end());
// });

// // === START SERVER ===
// app.listen(3000, () => {
//   console.log("🎵 Server running at http://localhost:3000");
// });




const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config(); // 👈 Loads .env automatically


const connectDB = require("./config/db");
const { getCurrentUser } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const streamRoutes = require("./routes/streamRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(getCurrentUser);

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", playlistRoutes);
app.use("/", streamRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 Server running on http://localhost:${PORT}`);
});
