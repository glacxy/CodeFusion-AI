import { useState } from "react";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-purple-900/20 p-8 rounded-2xl w-96 border border-purple-500">

        <h1 className="text-4xl text-center text-white mb-2">
          Join Tech Galaxy 🚀
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Create your CodeFusion AI account
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded bg-gray-900 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-gray-900 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-gray-900 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 mb-4 rounded bg-gray-900 text-white"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="w-full bg-purple-600 py-3 rounded-xl hover:bg-purple-700">
          Register
        </button>

      </div>
    </div>
  );
}

export default Register;