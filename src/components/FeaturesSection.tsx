const features = [
  {
    id: 1,
    icon: "🎓",
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with years of real-world experience.",
  },
  {
    id: 2,
    icon: "💡",
    title: "Hands-On Projects",
    description:
      "Build your portfolio with practical projects that showcase your skills.",
  },
  {
    id: 3,
    icon: "📈",
    title: "Career Growth",
    description:
      "Track your progress and advance your career with personalized learning paths.",
  },
  {
    id: 4,
    icon: "🤝",
    title: "Job Placement",
    description:
      "Connect with top employers and find your next career opportunity.",
  },
  {
    id: 5,
    icon: "⚡",
    title: "Interactive Learning",
    description:
      "Engage with dynamic content, quizzes, and real-time feedback.",
  },
  {
    id: 6,
    icon: "🏆",
    title: "Certifications",
    description:
      "Earn industry-recognized certificates to validate your achievements.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We provide everything you need to accelerate your career growth and
            achieve your professional goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#295bbe] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-[#295bbe] to-transparent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
