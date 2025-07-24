import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  return (
    <nav className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-lg border-b border-blue-100 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Your App
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Services
              </Link>
              <Link
                to="/contact"
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Auth Links */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-blue-700 text-sm font-medium">
                    Welcome, {user?.username}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden bg-white/80 backdrop-blur-sm rounded-lg mx-2 mb-2 shadow-lg border border-blue-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              Contact
            </Link>
            {isAuthenticated ? (
              <>
                <div className="text-blue-700 block px-3 py-2 text-base font-medium">
                  Welcome, {user?.username}!
                </div>
                <button
                  onClick={handleLogout}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white block px-3 py-2 rounded-lg text-base font-medium shadow-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
