import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-purple-400">
        CodeFusion AI
      </h1>

      <div className="space-x-6">
        <Link to="/" className="text-white hover:text-purple-400">
          Home
        </Link>

        <Link to="/login" className="text-white hover:text-purple-400">
          Login
        </Link>

        <Link to="/register" className="text-white hover:text-purple-400">
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
