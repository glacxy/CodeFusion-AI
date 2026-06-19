import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const SOCKET_URL = "http://localhost:5000";

function Room() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const lastRemoteCodeRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("// Start Coding...");
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
      if (!roomId) {
        console.warn("[socket] cannot join room because roomId is missing");
        return;
      }

      console.log("[socket] emitting joinRoom:", { roomId, socketId: socket.id });
      socket.emit("joinRoom", roomId);
    };

    socket.on("connect", () => {
      console.log("[socket] connected:", {
        socketId: socket.id,
        url: SOCKET_URL,
        transport: socket.io.engine.transport.name,
      });
      setIsSocketConnected(true);
      joinCurrentRoom();
    });

    socket.io.engine.on("upgrade", (transport) => {
      console.log("[socket] transport upgraded:", transport.name);
    });

    socket.on("connect_error", (error) => {
      console.error("[socket] connect_error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[socket] disconnected:", reason);
      setIsSocketConnected(false);
    });

    socket.on("roomJoined", (data) => {
      console.log("[joinRoom] server acknowledged:", data);
    });

    socket.on("receiveMessage", (data) => {
      console.log("[receiveMessage] received:", data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on("receiveCode", (data) => {
      console.log("[receiveCode] received:", data);

      if (!data || data.roomId !== roomId || typeof data.code !== "string") {
        console.warn("[receiveCode] ignored invalid or wrong-room payload:", data);
        return;
      }

      lastRemoteCodeRef.current = data.code;
      console.log("[receiveCode] applying remote code with setCode:", {
        roomId: data.roomId,
        fromSocketId: data.socketId,
        codeLength: data.code.length,
        reason: data.reason,
      });
      setCode(data.code);
    });

    return () => {
      console.log("[socket] cleaning up room socket:", { roomId, socketId: socket.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = () => {
    const socket = socketRef.current;

    if (!message.trim()) return;

    if (!socket?.connected) {
      console.warn("[sendMessage] socket is not connected");
      return;
    }

    const payload = {
      roomId,
      message,
    };

    console.log("[sendMessage] emitting:", payload);
    socket.emit("sendMessage", payload);
    setMessage("");
  };

  const handleCodeChange = (value) => {
    const socket = socketRef.current;
    const updatedCode = value || "";

    setCode(updatedCode);

    if (lastRemoteCodeRef.current === updatedCode) {
      console.log("[codeChange] skipped emit for exact remote Monaco update:", {
        roomId,
        codeLength: updatedCode.length,
      });
      lastRemoteCodeRef.current = null;
      return;
    }

    lastRemoteCodeRef.current = null;

    if (!socket?.connected) {
      console.warn("[codeChange] socket is not connected; change was not sent");
      return;
    }

    const payload = {
      roomId,
      code: updatedCode,
    };

    console.log("[codeChange] emitting:", {
      roomId: payload.roomId,
      codeLength: payload.code.length,
    });

    socket.emit("codeChange", payload);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl text-purple-500 mb-2">Room: {roomId}</h1>
      <p className="text-sm text-gray-400 mb-6">
        Socket: {isSocketConnected ? "connected" : "disconnected"}
      </p>

      <div className="bg-gray-900 p-4 rounded h-60 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={`${msg.socketId || "message"}-${index}`} className="bg-purple-700 p-2 rounded mb-2">
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-3 rounded bg-gray-800"
        />

        <button onClick={sendMessage} className="bg-purple-600 px-5 rounded hover:bg-purple-700">
          Send
        </button>
      </div>

      <div className="mt-8">
        <Editor
          height="500px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={() => {
            console.log("[monaco] editor mounted:", { roomId });
          }}
        />
      </div>
    </div>
  );
}

export default Room;
