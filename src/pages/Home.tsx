import { useAuth } from "../hooks/useAuth";
import HeroCarousel from "../components/HeroCarousel";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import { Link } from "react-router";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#295bbe] to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-white border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-white font-medium">Loading your experience...</p>
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

      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && (
        <section className="bg-gradient-to-r from-[#295bbe]/10 to-blue-100/50 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Welcome back, <span className="text-[#295bbe]">{user?.username}</span>! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-8">Ready to continue your learning journey?</p>

            {/* User Progress Stats */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Lessons Completed</p>
                    <p className="text-3xl font-bold text-blue-800">{user?.lessons_completed || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Total Score</p>
                    <p className="text-3xl font-bold text-green-800">{user?.total_lesson_score || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lessons"
                className="bg-[#295bbe] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#1e4a99] transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                Continue Learning
              </Link>
              <Link
                to="/jobs"
                className="border-2 border-[#295bbe] text-[#295bbe] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#295bbe] hover:text-white transform hover:-translate-y-1 transition-all duration-300">
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
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">Join thousands of professionals who have already accelerated their careers with our platform.</p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="bg-white text-[#295bbe] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Your Journey
              </Link>
              <Link
                to="/lessons"
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#295bbe] transform hover:-translate-y-1 transition-all duration-300">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">{user?.email}</h3>
                <p className="text-blue-100">Your Email</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">{user?.username}</h3>
                <p className="text-blue-100">Username</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">{user?.is_active ? "Active" : "Inactive"}</h3>
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
