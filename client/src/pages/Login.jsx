import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const response = await loginUser({
        identifier,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

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

        {error && (
          <div className="mb-4 rounded bg-red-500/20 border border-red-500 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="text-right mb-4">
          <button className="text-pink-400 hover:text-pink-300">
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 py-3 rounded-xl hover:bg-purple-700"
        >
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;
