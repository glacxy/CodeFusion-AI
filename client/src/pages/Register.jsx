import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
const navigate = useNavigate();
const handleRegister = async () => {
  setError("");

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {

    const response = await registerUser({
      username,
      email,
      password
    });

    console.log(response.data);

    localStorage.setItem(
      "token",
      response.data.token
    );

    navigate("/dashboard");

  } catch (error) {

    console.log(error);

    setError(error.response?.data?.message || "Registration failed. Please try again.");

  }

};
  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="bg-purple-900/20 p-8 rounded-2xl w-96 border border-purple-500">

        <h1 className="text-4xl text-center text-white mb-2">
          Join Tech Galaxy
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
        {error && (
          <div className="mb-4 rounded bg-red-500/20 border border-red-500 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <button
  onClick={handleRegister}
  className="w-full bg-purple-600 py-3 rounded-xl hover:bg-purple-700"
>
  Register
</button>


      </div>
    </div>
  );
}

export default Register;
