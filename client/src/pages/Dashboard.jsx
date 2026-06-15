import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRooms } from "../api/roomApi";

function Dashboard() {
const navigate = useNavigate();

const username = "Galaxy";

const [roomId, setRoomId] = useState("");
const [rooms, setRooms] = useState([]);

useEffect(() => {
const fetchRooms = async () => {
try {
const token = localStorage.getItem("token");
    const response = await getRooms(token);

    setRooms(response.data);
  } catch (error) {
    console.log(error);
  }
};

fetchRooms();
}, []);

return ( <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6">
  <div className="flex justify-between items-center mb-10">
    <h1 className="text-3xl font-bold">
      Welcome {username} 🚀
    </h1>

    <button
      onClick={() => {
        localStorage.removeItem("token");
        navigate("/login");
      }}
      className="bg-red-600 px-4 py-2 rounded-xl hover:bg-red-700"
    >
      Logout
    </button>
  </div>

  <div className="grid md:grid-cols-3 gap-4 mb-8">

    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500">
      <h3 className="text-gray-400">Rooms Created</h3>

      <p className="text-3xl font-bold text-purple-400">
        {rooms.length}
      </p>
    </div>

    <div className="bg-pink-900/20 p-4 rounded-xl border border-pink-500">
      <h3 className="text-pink-300">Collaborations</h3>

      <p className="text-3xl font-bold text-pink-400">
        0
      </p>
    </div>

    <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500">
      <h3 className="text-indigo-300">Coding Hours</h3>

      <p className="text-3xl font-bold text-indigo-400">
        0
      </p>
    </div>

  </div>

  <div className="grid md:grid-cols-3 gap-6">

    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold text-pink-400">
        Create Room
      </h2>

      <p className="text-gray-300 mt-2">
        Start a new coding workspace
      </p>

      <button
        onClick={() => navigate("/create-room")}
        className="mt-4 bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-700"
      >
        Create
      </button>
    </div>

    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold text-pink-400">
        Join Room
      </h2>

      <p className="text-gray-300 mt-2">
        Enter room ID to collaborate
      </p>

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full mt-4 p-2 bg-gray-900 rounded border border-purple-700"
      />

      <button
        onClick={() => {
          if (!roomId.trim()) {
            alert("Enter Room ID");
            return;
          }

          navigate(`/room/${roomId}`);
        }}
        className="mt-4 bg-purple-600 px-4 py-2 rounded-xl w-full hover:bg-purple-700"
      >
        Join
      </button>
    </div>

    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold text-pink-400">
        Active Rooms
      </h2>

      {rooms.length === 0 ? (
        <p className="text-gray-300 mt-4">
          No rooms available
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-black/30 p-3 rounded-lg border border-purple-700"
            >
              <p className="font-semibold">
                {room.roomName}
              </p>

              <p className="text-xs text-gray-400">
                ID: {room._id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>

  </div>

</div>

);
}

export default Dashboard;
