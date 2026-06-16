import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Room() {
  const { roomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
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

      <div className="bg-gray-900 p-4 rounded h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-purple-700 p-2 rounded mb-2"
          >
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

        <button
          onClick={sendMessage}
          className="bg-purple-600 px-5 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Room;