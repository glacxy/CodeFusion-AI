function Features() {
  const features = [
    {
      title: "Real-Time Coding",
      desc: "Collaborate with multiple developers instantly."
    },
    {
      title: "AI Code Review",
      desc: "Get bug detection and optimization suggestions."
    },
    {
      title: "Interview Mode",
      desc: "Practice coding interviews with evaluation."
    }
  ];

  return (
    <section className="py-20 px-8">
      <h2 className="text-5xl font-bold text-center mb-12">
        Features ✨
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-purple-900/20 border border-purple-500 rounded-2xl p-6 hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold text-pink-400">
              {feature.title}
            </h3>

            <p className="mt-4 text-gray-300">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;