import { useState } from "react";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-purple-900/20 p-8 rounded-2xl w-96 border border-purple-500">

        <h1 className="text-4xl text-center text-white mb-2">
          Welcome Back 💜
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Login to continue coding
        </p>

        <input
          type="text"
          placeholder="Username or Email"
          className="w-full p-3 mb-4 rounded bg-gray-900 text-white"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-2 rounded bg-gray-900 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-right mb-4">
          <button className="text-pink-400 hover:text-pink-300">
            Forgot Password?
          </button>
        </div>

        <button className="w-full bg-purple-600 py-3 rounded-xl hover:bg-purple-700">
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;