import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-indigo-100 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-purple-100 rounded-full opacity-25 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Error code with glow effect */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 drop-shadow-sm">404</h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-extrabold text-blue-200 blur-sm -z-10">404</div>
        </div>

        {/* Main message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">The page you're looking for seems to have wandered off into the digital void. Don't worry, we'll help you find your way back!</p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              <span className="relative flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go Back Home
              </span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Additional help text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Still lost? Try searching from our{" "}
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors duration-200">
                homepage
              </Link>{" "}
              or contact support if you need assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
