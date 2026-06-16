const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket Events
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Join Room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    console.log(`🟣 ${socket.id} joined room ${roomId}`);
  });

  // Send Message
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);

    console.log(
      `💬 Message in room ${data.roomId}: ${data.message}`
    );
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

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

// Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect database:", error);
    process.exit(1);
  }
};

startServer();