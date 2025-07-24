import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          {isAuthenticated
            ? `Welcome back, ${user?.username}!`
            : "Welcome to Your App"}
        </h1>
        <p className="text-xl text-blue-700 mb-8">
          {isAuthenticated
            ? "You are successfully logged in and ready to explore!"
            : "This is your home page with a beautiful navbar"}
        </p>

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100 max-w-2xl mx-auto">
          {isAuthenticated ? (
            <>
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                Your Dashboard
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-700">
                    <strong>Email:</strong> {user?.email}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-700">
                    <strong>Username:</strong> {user?.username}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-700">
                    <strong>Account Status:</strong>{" "}
                    {user?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                Getting Started
              </h2>
              <p className="text-blue-600 leading-relaxed mb-6">
                Your application has been successfully created with
                authentication, beautiful UI, and a clean design using Tailwind
                CSS.
              </p>
              <div className="space-y-4">
                <a
                  href="/auth/register"
                  className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                  Create Your Account
                </a>
                <a
                  href="/auth/login"
                  className="block text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-lg border-2 border-blue-200 transition-all duration-200 font-medium"
                >
                  Sign In to Existing Account
                </a>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">Modern Design</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">Authentication</span>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">API Integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
