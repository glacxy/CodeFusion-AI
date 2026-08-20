require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const executeRoutes = require("./routes/executeRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const server = http.createServer(app);
const roomParticipants = new Map();
const roomCodeState = new Map();

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", process.env.CLIENT_URL].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const getOrCreateRoom = (roomId) => {
  if (!roomParticipants.has(roomId)) {
    roomParticipants.set(roomId, new Map());
  }

  return roomParticipants.get(roomId);
};

const serializeParticipants = (participantsMap) =>
  Array.from(participantsMap.values()).sort((a, b) => a.joinedAt - b.joinedAt);

const broadcastRoomUsers = (roomId) => {
  const room = roomParticipants.get(roomId);
  if (!room) return;

  const participants = serializeParticipants(room);
  io.to(roomId).emit("room_users", participants);
};

const handleJoinRoom = (socket, payload) => {
  const roomId = typeof payload === "string" ? payload : payload?.roomId || payload?.room;
  if (!roomId) return;

  const room = getOrCreateRoom(roomId);
  const user = typeof payload === "object" && payload?.user ? payload.user : {};
  const participant = {
    socketId: socket.id,
    userId: user.id || user.userId || null,
    username: user.username || user.name || `Guest-${socket.id.slice(0, 4)}`,
    isHost: room.size === 0,
    joinedAt: Date.now(),
  };

  socket.join(roomId);
  socket.data.joinedRooms = socket.data.joinedRooms || new Set();
  socket.data.joinedRooms.add(roomId);
  room.set(socket.id, participant);

  const participants = serializeParticipants(room);
  const state = roomCodeState.get(roomId) || { files: {}, currentFile: null };
  socket.emit("room_users", participants);
  socket.emit("join_room", { roomId, participant, participants });
  socket.emit("roomJoined", { roomId, participants });
  if (state.currentFile || Object.keys(state.files || {}).length) {
    socket.emit("receiveCode", { roomId, ...state });
  }
  socket.broadcast.to(roomId).emit("user_joined", participant);
  broadcastRoomUsers(roomId);
};

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("joinRoom", (payload) => handleJoinRoom(socket, payload));
  socket.on("join_room", (payload) => handleJoinRoom(socket, payload));

  socket.on("sendMessage", (data) => {
    if (!data?.roomId) return;
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("codeChange", (payload) => {
    if (!payload?.roomId) return;
    const roomId = payload.roomId;
    roomCodeState.set(roomId, {
      files: payload.files || {},
      currentFile: payload.currentFile || null,
    });
    socket.to(roomId).emit("receiveCode", payload);
  });

  socket.on("disconnect", () => {
    const joinedRooms = Array.from(socket.data.joinedRooms || []);

    joinedRooms.forEach((roomId) => {
      const room = roomParticipants.get(roomId);
      if (!room) return;

      const participant = room.get(socket.id);
      if (!participant) return;

      room.delete(socket.id);
      if (room.size === 0) {
        roomParticipants.delete(roomId);
        roomCodeState.delete(roomId);
      } else {
        broadcastRoomUsers(roomId);
      }

      socket.broadcast.to(roomId).emit("user_left", participant);
    });

    console.log("🔴 User Disconnected:", socket.id);
  });
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/ai", aiRoutes);

app.get("/db-test", (req, res) => {
  res.json({ ok: true, message: "DB test route working" });
});

app.get("/", (req, res) => {
  res.send("CodeFusion AI Backend Running");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDB();

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Stop the existing server process and try again.`);
      } else {
        console.error("❌ Server startup error:", error.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
