import { useAuth } from "../hooks/useAuth";
import HeroCarousel from "../components/HeroCarousel";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { authApi, type UserBestJobPerformance } from "../utils/api";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bestJob, setBestJob] = useState<UserBestJobPerformance | null>(null);
  const [loadingBestJob, setLoadingBestJob] = useState(false);

  useEffect(() => {
    const fetchBestJob = async () => {
      if (isAuthenticated && user) {
        try {
          setLoadingBestJob(true);
          const jobData = await authApi.getUserBestJob();
          setBestJob(jobData);
        } catch (error) {
          // Silently ignore errors - user might not have any lesson data yet
          console.log("No best job data available:", error);
        } finally {
          setLoadingBestJob(false);
        }
      }
    };

    fetchBestJob();
  }, [isAuthenticated, user]);

  const formatExperienceLevel = (level: string | undefined) => {
    if (!level) return "";
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#295bbe] to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-white border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-white font-medium">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full py-6 md:py-8">
        <HeroCarousel />
      </section>

      {/* About Us Section - Bridge Enhanced UI */}
      <section className="w-full py-14 bg-white border-gray-200">
        <div className="container mx-auto px-4 flex flex-col items-center max-w-4xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full flex flex-col md:flex-row items-center gap-10 border border-[#295bbe]/20">
            <div className="flex-shrink-0 flex flex-col items-center gap-4 w-full md:w-auto">
              <div className="bg-gradient-to-tr from-[#295bbe] to-blue-400 rounded-full shadow-lg p-2 border-4 border-white">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Bridge Logo"
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Team Member"
                  className="w-10 h-10 rounded-full border-2 border-[#295bbe]"
                />
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Team Member"
                  className="w-10 h-10 rounded-full border-2 border-[#295bbe]"
                />
                <img
                  src="https://randomuser.me/api/portraits/men/65.jpg"
                  alt="Team Member"
                  className="w-10 h-10 rounded-full border-2 border-[#295bbe]"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-extrabold text-[#295bbe] mb-3 flex items-center justify-center md:justify-start gap-2">
                <span>
                  <svg
                    className="inline w-8 h-8 text-[#295bbe] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10v6a1 1 0 001 1h16a1 1 0 001-1v-6M3 10l9-7 9 7"
                    />
                  </svg>
                </span>
                Bridge
              </h2>
              <p className="text-xl text-gray-700 mb-4 font-semibold">
                Empowering your journey from learning to career success.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#295bbe]/10 to-blue-100 px-4 py-2 rounded-full shadow text-[#295bbe] font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3"
                    />
                  </svg>
                  Interactive Lessons
                </span>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#295bbe]/10 to-blue-100 px-4 py-2 rounded-full shadow text-[#295bbe] font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 17l-4 4m0 0l-4-4m4 4V3"
                    />
                  </svg>
                  Career Matching
                </span>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#295bbe]/10 to-blue-100 px-4 py-2 rounded-full shadow text-[#295bbe] font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 21m6-4l.75 4M4 4h16"
                    />
                  </svg>
                  Community Support
                </span>
              </div>
              <p className="text-md text-gray-600 max-w-xl mb-2">
                Bridge is a modern platform designed to help students, job
                seekers, and lifelong learners unlock their full potential. We
                connect education and employment through personalized learning,
                smart job recommendations, and a supportive community. Start
                your journey with Bridge and build the future you deserve!
              </p>
              <div className="flex gap-3 justify-center md:justify-start mt-4">
                <a
                  href="#"
                  className="bg-[#295bbe] text-white px-6 py-2 rounded-full font-bold shadow hover:bg-[#1e4a99] transition-all duration-300"
                >
                  Learn More
                </a>
                <a
                  href="#"
                  className="border-2 border-[#295bbe] text-[#295bbe] px-6 py-2 rounded-full font-bold shadow hover:bg-[#295bbe] hover:text-white transition-all duration-300"
                >
                  Join Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && (
        <section className="bg-gradient-to-r from-[#295bbe]/10 to-blue-100/50 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Welcome back,{" "}
              <span className="text-[#295bbe]">{user?.username}</span>! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Ready to continue your learning journey?
            </p>

            {/* User Progress Stats */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Lessons Completed
                    </p>
                    <p className="text-3xl font-bold text-blue-800">
                      {user?.lessons_completed || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Total Score
                    </p>
                    <p className="text-3xl font-bold text-green-800">
                      {user?.total_lesson_score || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Best Job Performance Card */}
              {bestJob ? (
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-600 mb-1">
                        Top Career Match
                      </p>
                      <p className="text-lg font-bold text-purple-800 mb-1">
                        {bestJob.job_info.position}
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {bestJob.job_info.company && (
                          <p>🏢 {bestJob.job_info.company}</p>
                        )}
                        {bestJob.job_info.experience_level && (
                          <p>
                            📊{" "}
                            {formatExperienceLevel(
                              bestJob.job_info.experience_level
                            )}
                          </p>
                        )}
                        <p>🎯 {bestJob.performance.total_job_score} pts</p>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg
                        className="w-8 h-8 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : loadingBestJob ? (
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent"></div>
                    <span className="ml-2 text-gray-600 text-sm">
                      Loading career match...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="text-center">
                    <div className="p-3 bg-gray-100 rounded-full inline-block mb-2">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Complete lessons to discover your career matches!
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lessons"
                className="bg-[#295bbe] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#1e4a99] transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Continue Learning
              </Link>
              <Link
                to="/jobs"
                className="border-2 border-[#295bbe] text-[#295bbe] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#295bbe] hover:text-white transform hover:-translate-y-1 transition-all duration-300"
              >
                Find Jobs
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-[#295bbe] to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who have already accelerated their
            careers with our platform.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="bg-white text-[#295bbe] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Journey
              </Link>
              <Link
                to="/lessons"
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#295bbe] transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {user?.email}
                </h3>
                <p className="text-blue-100">Your Email</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {user?.username}
                </h3>
                <p className="text-blue-100">Username</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {user?.is_active ? "Active" : "Inactive"}
                </h3>
                <p className="text-blue-100">Account Status</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
