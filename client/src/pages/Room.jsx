import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");

function Room() {
  const { roomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("// Start Coding...");

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

   socket.on("receiveCode", (newCode) => {
  console.log("RECEIVED:", newCode);

  setCode(newCode);
});
    return () => {
      socket.off("receiveMessage");
      socket.off("receiveCode");
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      roomId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl text-purple-500 mb-6">
        Room: {roomId}
      </h1>

      {/* Messages */}
      <div className="bg-gray-900 p-4 rounded h-60 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-purple-700 p-2 rounded mb-2"
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex gap-3 mt-4">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-3 rounded bg-gray-800"
        />

        <button
          onClick={sendMessage}
          className="bg-purple-600 px-5 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div>

      {/* Code Editor */}
      <div className="mt-8">
        <Editor
          height="500px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}

onChange={(value = "") => {
  console.log("SENDING:", value);

  setCode(value);

  socket.emit("codeChange", {
    roomId,
    code: value,
  });
}}
        />
      </div>
    </div>
  );
}

export default Room;