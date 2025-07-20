const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔍 Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI); // ✅ simplified
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
