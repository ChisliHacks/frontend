import { useState, useEffect } from "react";
import { Link } from "react-router";

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  background: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Master New Skills Today",
    subtitle: "Learn from Industry Experts",
    description:
      "Join thousands of learners who are advancing their careers with our comprehensive courses and hands-on projects.",
    buttonText: "Start Learning",
    buttonLink: "/lessons",
    image: "📚",
    background: "bg-gradient-to-r from-[#295bbe] to-[#1e4a99]",
  },
  {
    id: 2,
    title: "Find Your Dream Job",
    subtitle: "Career Opportunities Await",
    description:
      "Discover amazing job opportunities from top companies. Your perfect role is just one click away.",
    buttonText: "Browse Jobs",
    buttonLink: "/jobs",
    image: "💼",
    background: "bg-gradient-to-r from-[#295bbe] to-[#3b82f6]",
  },
  {
    id: 3,
    title: "Build Your Future",
    subtitle: "Skills + Opportunities = Success",
    description:
      "Combine learning with real-world opportunities. Build skills, gain experience, and land your dream job.",
    buttonText: "Get Started",
    buttonLink: "/auth/register",
    image: "🚀",
    background: "bg-gradient-to-r from-[#3b82f6] to-[#295bbe]",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const getSlidePosition = (slideIndex: number) => {
    const diff = slideIndex - currentSlide;

    if (diff === 0) return "translate-x-0";

    // Handle wraparound for smoother transitions
    if (diff === slides.length - 1 || (diff < 0 && diff !== -1)) {
      return "-translate-x-full";
    }
    if (diff === -(slides.length - 1) || (diff > 0 && diff !== 1)) {
      return "translate-x-full";
    }

    return diff > 0 ? "translate-x-full" : "-translate-x-full";
  };

  return (
    <div className="relative h-[600px] overflow-hidden rounded-2xl shadow-2xl mx-4 md:mx-6 lg:mx-8">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${getSlidePosition(
            index
          )}`}
        >
          <div
            className={`${slide.background} h-full flex items-center justify-center relative overflow-hidden`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-200"></div>
              <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-white rounded-full animate-pulse delay-300"></div>
            </div>

            <div className="container mx-auto px-6 md:px-8 lg:px-12 z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[500px]">
                <div className="text-white space-y-6 px-4 lg:px-0">
                  <div className="space-y-4">
                    <p className="text-lg md:text-xl font-medium opacity-90 animate-fade-in-up">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up delay-100">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-2xl animate-fade-in-up delay-200">
                      {slide.description}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                    <Link
                      to={slide.buttonLink}
                      className="bg-white text-[#295bbe] px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl inline-block text-center"
                    >
                      {slide.buttonText}
                    </Link>
                    <button className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-white hover:text-[#295bbe] transform hover:-translate-y-1 transition-all duration-300">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="text-center lg:text-right px-4 lg:px-0">
                  <div className="text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] opacity-80 animate-bounce-slow">
                    {slide.image}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
