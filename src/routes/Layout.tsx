import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "../components/Navbar";
import TunaChat from "../components/TunaChat";
import { useAuth } from "../hooks/useAuth";

const Layout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      <main>
        <Outlet />
      </main>

      {/* Floating Tuna AI Button - only show for logged in users */}
      {user && (
        <>
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
            title="Chat with Tuna AI Assistant"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐟</span>
              <span className="hidden sm:inline font-medium">Ask Tuna</span>
            </div>
          </button>

          <TunaChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      )}
    </div>
  );
};

export default Layout;
