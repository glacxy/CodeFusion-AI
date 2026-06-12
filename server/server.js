const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();

const app = express();
console.log("authRoutes type =", typeof authRoutes);
console.log("roomRoutes type =", typeof roomRoutes);
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Test Route
app.get("/db-test", (req, res) => {
  res.send("DB Test Route Working");
});
app.get("/", (req, res) => {
  res.send("CodeFusion AI Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect database:", error);
    process.exit(1);
  }
};

startServer();