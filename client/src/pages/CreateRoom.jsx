  import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../api/roomApi";


function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await createRoom(
        {
          roomName,
        },
        token
      );

      console.log(response.data);

      alert("Room Created Successfully 🚀");

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      setError(error.response?.data?.message || "Room Creation Failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-purple-900/20 border border-purple-500 p-8 rounded-2xl w-96">
        <h1 className="text-3xl text-white text-center mb-6">
          Create Room 🚀
        </h1>

        <input
          type="text"
          placeholder="Enter Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 text-white"
        />

        {error && <p className="text-red-500 mt-3">{error}</p>}

        <button
          onClick={handleCreateRoom}
          className="w-full mt-5 bg-purple-600 py-3 rounded-xl hover:bg-purple-700"
        >
          Create Room
        </button>
      </div>
    </div>
  );
}

export default CreateRoom;
