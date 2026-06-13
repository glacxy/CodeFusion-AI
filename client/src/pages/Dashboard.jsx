import { useNavigate } from "react-router-dom";

function Dashboard() {
const navigate = useNavigate();

const username = "Galaxy"; // later backend la irundhu varum

return ( <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6">

```
  {/* HEADER */}
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

  {/* STATS */}
  <div className="grid md:grid-cols-3 gap-4 mb-8">

    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500">
      <h3 className="text-gray-400">
        Rooms Created
      </h3>

      <p className="text-3xl font-bold text-purple-400">
        0
      </p>
    </div>

    <div className="bg-purple-900/20 p-4 rounded-xl border border-pink-500">
      <h3 className="text-gray-400">
        Collaborations
      </h3>

      <p className="text-3xl font-bold text-pink-400">
        0
      </p>
    </div>

    <div className="bg-purple-900/20 p-4 rounded-xl border border-cyan-500">
      <h3 className="text-gray-400">
        Coding Hours
      </h3>

      <p className="text-3xl font-bold text-cyan-400">
        0
      </p>
    </div>

  </div>

  {/* MAIN CARDS */}
  <div className="grid md:grid-cols-3 gap-6">

    {/* CREATE ROOM */}
    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl hover:scale-105 transition">

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

    {/* JOIN ROOM */}
    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl hover:scale-105 transition">

      <h2 className="text-2xl font-bold text-pink-400">
        Join Room
      </h2>

      <p className="text-gray-300 mt-2">
        Enter room ID to collaborate
      </p>

      <input
        placeholder="Room ID"
        className="w-full mt-4 p-2 bg-gray-900 rounded border border-purple-700"
      />

      <button className="mt-4 bg-purple-600 px-4 py-2 rounded-xl w-full hover:bg-purple-700">
        Join
      </button>

    </div>

    {/* ACTIVE ROOMS */}
    <div className="bg-purple-900/20 border border-purple-500 p-6 rounded-2xl hover:scale-105 transition">

      <h2 className="text-2xl font-bold text-pink-400">
        Active Rooms
      </h2>

      <p className="text-gray-300 mt-4">
        Create your first room and start collaborating 🚀
      </p>

    </div>

  </div>

</div>
);
}

export default Dashboard;
