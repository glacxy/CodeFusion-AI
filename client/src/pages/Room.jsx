import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

import ChatBox from "../components/ChatBox";
import Explorer from "../components/Explorer";
import Tabs from "../components/Tabs";
import OutputConsole from "../components/OutputConsole/OutputConsole";
import { executeCode } from "../api/executeApi";

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
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null); // null = no result yet
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");
  const [executionTimestamp, setExecutionTimestamp] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
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

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const code = files[currentFile] || "";
      const result = await executeCode(language, code, input);
      setOutput(result);
      setExecutionTimestamp(new Date());
    } catch (err) {
      const apiError = err?.response?.data;
      setOutput({
        success: false,
        status: "Error",
        error: apiError?.error || "Execution failed",
        stderr: apiError?.detail || err.message || "Unknown error",
        stdout: "",
        compileOutput: "",
      });
      setExecutionTimestamp(new Date());
    } finally {
      setIsRunning(false);
    }
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
    <option value="typescript">TypeScript</option>
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
          <div className="border-t border-[#2d2d30] bg-[#1e1e1e] p-4">
  {/* Standard input */}
  <div className="mb-4">
    <div className="mb-2 flex items-center justify-between">
      <label htmlFor="stdin" className="text-sm font-semibold text-gray-300">
        Standard Input
      </label>
      <button
        type="button"
        onClick={() => setInput("")}
        disabled={!input}
        className="rounded px-2 py-1 text-xs font-medium text-[#c5c5c5] transition hover:bg-[#3c3c3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Clear
      </button>
    </div>

    <textarea
      id="stdin"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      spellCheck="false"
      className="min-h-24 max-h-72 w-full resize-y rounded border border-[#3c3c3c] bg-[#252526] p-3 font-mono text-sm leading-6 text-white outline-none transition placeholder:text-[#858585] focus:border-[#007fd4] focus:ring-1 focus:ring-[#007fd4]"
      placeholder={"Provide input exactly as your program reads it.\nEach line is sent as a separate stdin line."}
    />
  </div>

  {/* Run Button */}
  <button
    disabled={isRunning}
    onClick={async () => {
      setIsRunning(true);
      setOutput(null);
      setActiveTerminalTab("output");
      try {
        const code = files[currentFile] || "";
        const result = await executeCode(language, code, input);
        setOutput(result);
        setExecutionTimestamp(new Date());
      } catch (err) {
        // Axios wraps HTTP error responses — extract the JSON body if present
        const apiError = err?.response?.data;
        setOutput({
          success: false,
          status: "Error",
          error: apiError?.error || "Execution failed",
          stderr: apiError?.detail || err.message || "Unknown error",
          stdout: "",
          compileOutput: "",
        });
        setExecutionTimestamp(new Date());
      } finally {
        setIsRunning(false);
      }
    }}
    className="mb-4 rounded bg-green-600 px-5 py-2 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isRunning ? "⏳ Running..." : "▶ Run"}
  </button>

  {/* Legacy terminal retained during the visual migration; it is not rendered. */}
  {activeTerminalTab === "legacy" && <section className="overflow-hidden rounded-lg border border-[#343434] bg-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
    <div className="flex items-center justify-between border-b border-[#2d2d30] bg-[#1b1b1b] pl-2">
      <div className="flex" role="tablist" aria-label="Execution terminal">
        {[
          ["output", "Output"],
          ["errors", "Errors"],
          ["info", "Execution Info"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTerminalTab === tab}
            onClick={() => setActiveTerminalTab(tab)}
            className={`border-b-2 px-3 py-2 text-xs font-medium transition ${
              activeTerminalTab === tab
                ? "border-[#007fd4] bg-[#252526] text-white"
                : "border-transparent text-[#a6a6a6] hover:bg-[#252526] hover:text-[#e7e7e7]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(output?.stdout || "")}
          disabled={!output?.stdout}
          className="rounded px-2 py-1 text-xs text-[#c5c5c5] transition hover:bg-[#333333] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy output
        </button>
        <button
          type="button"
          onClick={() => {
            setOutput(null);
            setExecutionTimestamp(null);
            setActiveTerminalTab("output");
          }}
          disabled={!output}
          className="rounded px-2 py-1 text-xs text-[#c5c5c5] transition hover:bg-[#333333] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>

    <div className="h-56 overflow-auto bg-[#0c0c0c] p-4 font-mono text-sm leading-6">
      {output === null ? (
        <p className="text-[#858585]">Run your code to see terminal output.</p>
      ) : activeTerminalTab === "output" ? (
        output.stdout ? (
          <pre className="whitespace-pre-wrap break-words text-[#d4d4d4]">
            <span className="select-none text-[#4ec9b0]">$ </span>
            {output.stdout}
          </pre>
        ) : (
          <p className="text-[#858585]">(no standard output)</p>
        )
      ) : activeTerminalTab === "errors" ? (
        output.compileOutput || output.stderr || output.error ? (
          <div className="space-y-4">
            {output.compileOutput ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#dcdcaa]">Compile error</p>
                <pre className="whitespace-pre-wrap break-words text-[#dcdcaa]">{output.compileOutput}</pre>
              </div>
            ) : null}
            {output.stderr ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#f48771]">Standard error</p>
                <pre className="whitespace-pre-wrap break-words text-[#f48771]">{output.stderr}</pre>
              </div>
            ) : null}
            {output.error && !output.stderr ? (
              <pre className="whitespace-pre-wrap break-words text-[#f48771]">{output.error}</pre>
            ) : null}
          </div>
        ) : (
          <p className="text-[#858585]">(no errors)</p>
        )
      ) : (
        <dl className="grid max-w-xl grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-[#9cdcfe]">Runtime</dt>
          <dd className="text-[#d4d4d4]">{output.runtime !== undefined ? `${output.runtime} ms` : "—"}</dd>
          <dt className="text-[#9cdcfe]">Memory</dt>
          <dd className="text-[#d4d4d4]">{output.memory !== undefined ? `${output.memory} MB` : "—"}</dd>
          <dt className="text-[#9cdcfe]">Exit Code</dt>
          <dd className="text-[#d4d4d4]">{output.exitCode ?? "—"}</dd>
          <dt className="text-[#9cdcfe]">Language</dt>
          <dd className="text-[#d4d4d4]">{output.displayName || language}{output.version ? ` ${output.version}` : ""}</dd>
          <dt className="text-[#9cdcfe]">Timestamp</dt>
          <dd className="text-[#d4d4d4]">{executionTimestamp?.toLocaleString() || "—"}</dd>
          <dt className="text-[#9cdcfe]">Status</dt>
          <dd className={output.status === "Accepted" ? "text-[#4ec9b0]" : "text-[#f48771]"}>{output.status || "Error"}</dd>
        </dl>
      )}
    </div>
  </section>}

  <OutputConsole
    output={output}
    isRunning={isRunning}
    language={language}
    timestamp={executionTimestamp}
    onRerun={handleRun}
    onClear={() => {
      setOutput(null);
      setExecutionTimestamp(null);
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
