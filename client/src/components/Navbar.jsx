function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-purple-400">
        CodeFusion AI
      </h1>

      <div className="space-x-6">
        <button className="text-white hover:text-purple-400">
          Home
        </button>

        <button className="text-white hover:text-purple-400">
          Features
        </button>

        <button className="text-white hover:text-purple-400">
          Login
        </button>
      </div>
    </nav>
  );
}

export default Navbar;