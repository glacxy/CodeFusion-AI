function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Welcome To Tech Galaxy 🚀
      </h1>

      <p className="mt-6 text-xl text-gray-300">
        Build together. Code together.
      </p>

      <button className="mt-8 px-8 py-4 rounded-xl bg-purple-600">
        Start Coding
      </button>
    </section>
  );
}

export default Hero;