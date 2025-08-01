const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require('dotenv');
const crypto = require("node:crypto");
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

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


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
app.use("/", playlistRoutes);
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' https://cdn.tailwindcss.com https://www.youtube.com;");
  next();
});


app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://www.youtube.com 'nonce-${nonce}';`
  );
  next();
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 Server running on http://localhost:${PORT}`);
});
