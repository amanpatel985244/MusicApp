// const mongoose = require("mongoose");
// const dotenv = require('dotenv');

// const connectDB = async () => {
//   try {
//     const uri = "mongodb://localhost:27017/musicApp"; // TEMP
//     console.log("🔍 Connecting to:", uri);
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB connected successfully");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    console.log("🔍 Connecting to:", process.env.MONGODB_URI); // Debug log
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
