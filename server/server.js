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

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.some((allowedOrigin) => allowedOrigin.test(origin));
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn("[CORS] Blocked origin:", origin);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn("[Socket.IO CORS] Blocked origin:", origin);
      return callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const roomCode = new Map();

io.on("connection", (socket) => {
  console.log("[socket] connected:", {
    socketId: socket.id,
    origin: socket.handshake.headers.origin,
    transport: socket.conn.transport.name,
  });

  socket.conn.on("upgrade", (transport) => {
    console.log("[socket] transport upgraded:", {
      socketId: socket.id,
      transport: transport.name,
    });
  });

  socket.on("joinRoom", (roomId) => {
    if (!roomId) {
      console.warn("[joinRoom] missing roomId:", { socketId: socket.id });
      return;
    }

    socket.join(roomId);

    const existingCode = roomCode.get(roomId);

    console.log("[joinRoom] socket joined room:", {
      socketId: socket.id,
      roomId,
      rooms: Array.from(socket.rooms),
      hasExistingCode: typeof existingCode === "string",
    });

    socket.emit("roomJoined", { roomId, socketId: socket.id });

    if (typeof existingCode === "string") {
      socket.emit("receiveCode", {
        roomId,
        code: existingCode,
        socketId: "server",
        reason: "room-state-sync",
      });

      console.log("[joinRoom] sent existing code to joining socket:", {
        socketId: socket.id,
        roomId,
        codeLength: existingCode.length,
      });
    }
  });

  socket.on("sendMessage", (data) => {
    const { roomId, message } = data || {};

    if (!roomId || typeof message !== "string") {
      console.warn("[sendMessage] invalid payload:", { socketId: socket.id, data });
      return;
    }

    io.to(roomId).emit("receiveMessage", { roomId, message, socketId: socket.id });

    console.log("[sendMessage] broadcast:", {
      socketId: socket.id,
      roomId,
      messageLength: message.length,
    });
  });

  socket.on("codeChange", (data) => {
    const { roomId, code } = data || {};

    if (!roomId || typeof code !== "string") {
      console.warn("[codeChange] invalid payload:", { socketId: socket.id, data });
      return;
    }

    roomCode.set(roomId, code);

    socket.to(roomId).emit("receiveCode", {
      roomId,
      code,
      socketId: socket.id,
      reason: "peer-code-change",
    });

    console.log("[codeChange] received and forwarded:", {
      socketId: socket.id,
      roomId,
      codeLength: code.length,
      recipientRoomSize: io.sockets.adapter.rooms.get(roomId)?.size || 0,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", {
      socketId: socket.id,
      reason,
    });
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/db-test", (req, res) => {
  res.send("DB Test Route Working");
});

app.get("/", (req, res) => {
  res.send("CodeFusion AI Backend Running");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`[server] running on port ${PORT}`);
      console.log("[server] CORS accepts http://localhost:<any-port> and http://127.0.0.1:<any-port>");
    });
  } catch (error) {
    console.error("[server] failed to connect database:", error);
    process.exit(1);
  }
};

startServer();
