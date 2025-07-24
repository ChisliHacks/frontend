const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Welcome to Your App</h1>
        <p className="text-xl text-blue-700 mb-8">This is your home page with a beautiful navbar</p>

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Getting Started</h2>
          <p className="text-blue-600 leading-relaxed">
            Your navbar has been successfully created with navigation links, mobile responsiveness, and a clean design using Tailwind CSS with a beautiful light blue theme.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">Modern Design</span>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">Responsive Layout</span>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span className="font-medium">Light Theme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
