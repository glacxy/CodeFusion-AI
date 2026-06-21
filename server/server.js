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

const createInitialFiles = () => ({
  "App.jsx": `import Room from "./Room";

function App() {
  return <Room />;
}

export default App;
`,
  "main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
  "Room.jsx": `function Room() {
  return (
    <main>
      <h1>Welcome to CodeFusion AI</h1>
    </main>
  );
}

export default Room;
`,
});

const roomFiles = new Map();
const roomCurrentFiles = new Map();

const cloneFiles = (files) => ({ ...files });
const hasFile = (files, fileName) => Object.prototype.hasOwnProperty.call(files, fileName);

const isValidFilesObject = (files) => {
  if (!files || typeof files !== "object" || Array.isArray(files)) return false;

  return Object.entries(files).every(
    ([fileName, code]) =>
      typeof fileName === "string" &&
      fileName.trim().length > 0 &&
      typeof code === "string"
  );
};

const getRoomState = (roomId) => {
  if (!roomFiles.has(roomId)) {
    const files = createInitialFiles();
    roomFiles.set(roomId, files);
    roomCurrentFiles.set(roomId, "App.jsx");
  }

  const files = roomFiles.get(roomId);
  const currentFile = roomCurrentFiles.get(roomId);

  if (!hasFile(files, currentFile)) {
    roomCurrentFiles.set(roomId, Object.keys(files)[0] || "App.jsx");
  }

  return {
    roomId,
    files: cloneFiles(roomFiles.get(roomId)),
    currentFile: roomCurrentFiles.get(roomId),
  };
};

const saveRoomState = (roomId, files, currentFile) => {
  const safeFiles = isValidFilesObject(files) ? cloneFiles(files) : createInitialFiles();
  const fileNames = Object.keys(safeFiles);
  const safeCurrentFile =
    typeof currentFile === "string" && hasFile(safeFiles, currentFile)
      ? currentFile
      : fileNames[0] || "App.jsx";

  roomFiles.set(roomId, safeFiles);
  roomCurrentFiles.set(roomId, safeCurrentFile);

  return getRoomState(roomId);
};

const emitRoomState = (socket, roomId, reason, includeSender = false) => {
  const state = {
    ...getRoomState(roomId),
    socketId: socket.id,
    reason,
  };

  if (includeSender) {
    io.to(roomId).emit("receiveCode", state);
    return;
  }

  socket.to(roomId).emit("receiveCode", state);
};

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
    const state = getRoomState(roomId);

    socket.emit("roomJoined", { roomId, socketId: socket.id });
    socket.emit("receiveCode", {
      ...state,
      socketId: "server",
      reason: "room-state-sync",
    });

    console.log("[joinRoom] socket joined room:", {
      socketId: socket.id,
      roomId,
      fileCount: Object.keys(state.files).length,
      currentFile: state.currentFile,
      roomSize: io.sockets.adapter.rooms.get(roomId)?.size || 0,
    });
  });

  socket.on("sendMessage", (data) => {
    const { roomId, message } = data || {};

    if (!roomId || typeof message !== "string" || !message.trim()) {
      console.warn("[sendMessage] invalid payload:", { socketId: socket.id, data });
      return;
    }

    io.to(roomId).emit("receiveMessage", {
      roomId,
      message: message.trim(),
      socketId: socket.id,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on("codeChange", (data) => {
    const { roomId, files, currentFile } = data || {};

    if (!roomId || !isValidFilesObject(files)) {
      console.warn("[codeChange] invalid payload:", { socketId: socket.id, data });
      return;
    }

    saveRoomState(roomId, files, currentFile);
    emitRoomState(socket, roomId, "peer-code-change");
  });

  socket.on("createFile", (data) => {
    const { roomId, fileName } = data || {};

    if (!roomId || typeof fileName !== "string" || !fileName.trim()) {
      console.warn("[createFile] invalid payload:", { socketId: socket.id, data });
      return;
    }

    const state = getRoomState(roomId);
    const nextFileName = fileName.trim();

    if (hasFile(state.files, nextFileName)) return;

    saveRoomState(roomId, { ...state.files, [nextFileName]: "" }, nextFileName);
    emitRoomState(socket, roomId, "file-created");
  });

  socket.on("renameFile", (data) => {
    const { roomId, oldFileName, newFileName } = data || {};

    if (
      !roomId ||
      typeof oldFileName !== "string" ||
      typeof newFileName !== "string" ||
      !newFileName.trim()
    ) {
      console.warn("[renameFile] invalid payload:", { socketId: socket.id, data });
      return;
    }

    const state = getRoomState(roomId);
    const trimmedNewFileName = newFileName.trim();

    if (!hasFile(state.files, oldFileName) || hasFile(state.files, trimmedNewFileName)) {
      return;
    }

    const nextFiles = {};
    Object.entries(state.files).forEach(([fileName, code]) => {
      nextFiles[fileName === oldFileName ? trimmedNewFileName : fileName] = code;
    });

    const nextCurrentFile =
      state.currentFile === oldFileName ? trimmedNewFileName : state.currentFile;

    saveRoomState(roomId, nextFiles, nextCurrentFile);
    emitRoomState(socket, roomId, "file-renamed");
  });

  socket.on("deleteFile", (data) => {
    const { roomId, fileName } = data || {};

    if (!roomId || typeof fileName !== "string") {
      console.warn("[deleteFile] invalid payload:", { socketId: socket.id, data });
      return;
    }

    const state = getRoomState(roomId);
    const fileNames = Object.keys(state.files);

    if (!hasFile(state.files, fileName) || fileNames.length <= 1) return;

    const nextFiles = { ...state.files };
    delete nextFiles[fileName];

    const nextCurrentFile =
      state.currentFile === fileName ? Object.keys(nextFiles)[0] : state.currentFile;

    saveRoomState(roomId, nextFiles, nextCurrentFile);
    emitRoomState(socket, roomId, "file-deleted");
  });

  socket.on("switchFile", (data) => {
    const { roomId, currentFile } = data || {};

    if (!roomId || typeof currentFile !== "string") {
      console.warn("[switchFile] invalid payload:", { socketId: socket.id, data });
      return;
    }

    const state = getRoomState(roomId);

    if (!hasFile(state.files, currentFile)) return;

    saveRoomState(roomId, state.files, currentFile);
    emitRoomState(socket, roomId, "file-switched");
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
