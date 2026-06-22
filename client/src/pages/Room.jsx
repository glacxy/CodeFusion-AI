import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

import ChatBox from "../components/ChatBox";
import Explorer from "../components/Explorer";
import Tabs from "../components/Tabs";

const SOCKET_URL = "http://localhost:5000";

const initialFiles = {
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
};

const getLanguageFromFileName = (fileName) => {
  if (fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) return "typescript";
  return "javascript";
};

const normalizeFileName = (fileName) => fileName.trim().replace(/^\/+/, "");

function Room() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const lastRemoteEditorValueRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState(initialFiles);
  const [currentFile, setCurrentFile] = useState("App.jsx");
  const [language, setLanguage] = useState("javascript");
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const joinCurrentRoom = () => {
      if (!roomId) return;
      socket.emit("joinRoom", roomId);
    };

    socket.on("connect", () => {
      setIsSocketConnected(true);
      joinCurrentRoom();
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[socket] connect_error:", error.message);
    });

    socket.on("roomJoined", (data) => {
      console.log("[joinRoom] server acknowledged:", data);
    });

    socket.on("receiveMessage", (data) => {
      if (!data || data.roomId !== roomId) return;
      setMessages((prev) => [...prev, data]);
    });

    socket.on("receiveCode", (data) => {
      if (!data || data.roomId !== roomId || !data.files) return;

      const nextCurrentFile =
        typeof data.currentFile === "string" && data.files[data.currentFile] !== undefined
          ? data.currentFile
          : Object.keys(data.files)[0];

      lastRemoteEditorValueRef.current = {
        fileName: nextCurrentFile,
        code: data.files[nextCurrentFile] || "",
      };

      setFiles(data.files);
      setCurrentFile(nextCurrentFile);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("roomJoined");
      socket.off("receiveMessage");
      socket.off("receiveCode");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const emitCodeState = (nextFiles, nextCurrentFile) => {
    const socket = socketRef.current;

    if (!socket?.connected) return;

    socket.emit("codeChange", {
      roomId,
      files: nextFiles,
      currentFile: nextCurrentFile,
    });
  };

  const sendMessage = () => {
    const socket = socketRef.current;
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !socket?.connected) return;

    socket.emit("sendMessage", {
      roomId,
      message: trimmedMessage,
    });

    setMessage("");
  };

  const handleCodeChange = (value) => {
    const updatedCode = value || "";
    const remoteEditorValue = lastRemoteEditorValueRef.current;

    if (
      remoteEditorValue &&
      remoteEditorValue.fileName === currentFile &&
      remoteEditorValue.code === updatedCode
    ) {
      lastRemoteEditorValueRef.current = null;
      return;
    }

    setFiles((prevFiles) => {
      if (prevFiles[currentFile] === updatedCode) return prevFiles;

      const nextFiles = {
        ...prevFiles,
        [currentFile]: updatedCode,
      };

      emitCodeState(nextFiles, currentFile);
      return nextFiles;
    });
  };

  const handleSwitchFile = (fileName) => {
    if (!files[fileName] && files[fileName] !== "") return;

    setCurrentFile(fileName);
    socketRef.current?.emit("switchFile", {
      roomId,
      currentFile: fileName,
    });
  };

  const handleCreateFile = (rawFileName) => {
    const fileName = normalizeFileName(rawFileName);

    if (!fileName || files[fileName] !== undefined) return;

    const nextFiles = {
      ...files,
      [fileName]: "",
    };

    setFiles(nextFiles);
    setCurrentFile(fileName);

    socketRef.current?.emit("createFile", {
      roomId,
      fileName,
    });
  };

  const handleRenameFile = (oldFileName, rawNewFileName) => {
    const newFileName = normalizeFileName(rawNewFileName);

    if (!newFileName || oldFileName === newFileName || files[newFileName] !== undefined) {
      return;
    }

    const nextFiles = {};
    Object.entries(files).forEach(([fileName, code]) => {
      nextFiles[fileName === oldFileName ? newFileName : fileName] = code;
    });

    const nextCurrentFile = currentFile === oldFileName ? newFileName : currentFile;

    setFiles(nextFiles);
    setCurrentFile(nextCurrentFile);

    socketRef.current?.emit("renameFile", {
      roomId,
      oldFileName,
      newFileName,
    });
  };

  const handleDeleteFile = (fileName) => {
    const fileNames = Object.keys(files);
    if (fileNames.length <= 1 || files[fileName] === undefined) return;

    const nextFiles = { ...files };
    delete nextFiles[fileName];

    const nextCurrentFile =
      currentFile === fileName ? Object.keys(nextFiles)[0] : currentFile;

    setFiles(nextFiles);
    setCurrentFile(nextCurrentFile);

    socketRef.current?.emit("deleteFile", {
      roomId,
      fileName,
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#1e1e1e] text-white">
      <header className="flex h-11 items-center justify-between border-b border-[#2d2d30] bg-[#181818] px-4">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-[#e7e7e7]">
            CodeFusion AI - Room {roomId}
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#a6a6a6]">

  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    className="rounded bg-[#252526] px-2 py-1 text-white outline-none"
  >
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="java">Java</option>
    <option value="cpp">C++</option>
    <option value="c">C</option>
  </select>

  <span
    className={`h-2 w-2 rounded-full ${
      isSocketConnected ? "bg-[#4ec9b0]" : "bg-[#f14c4c]"
    }`}
  />

  {isSocketConnected ? "Live" : "Offline"}

</div>
      </header>

      <div className="flex h-[calc(100vh-44px)] min-h-0">
        <Explorer
          files={files}
          currentFile={currentFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onSwitchFile={handleSwitchFile}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-[#1e1e1e]">
          <Tabs
            files={files}
            currentFile={currentFile}
            onSwitchFile={handleSwitchFile}
            onDeleteFile={handleDeleteFile}
          />

          <div className="min-h-0 flex-1">
            <Editor
         key={currentFile}
           height="100%"
      language={language}
              theme="vs-dark"
              value={files[currentFile] || ""}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                fontFamily:
                  "Consolas, 'Courier New', monospace",
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </main>

        <ChatBox
          messages={messages}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={sendMessage}
          isSocketConnected={isSocketConnected}
        />
      </div>
    </div>
  );
}

export default Room;
