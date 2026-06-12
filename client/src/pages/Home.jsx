import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}

export default Home;