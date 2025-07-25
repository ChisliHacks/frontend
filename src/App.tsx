import { RouterProvider } from "react-router";
import { router } from "./routes/router";
import { AuthProvider } from "./contexts/AuthContext";

import VoiceAssistant from "./components/VoiceAssistant";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <VoiceAssistant />
    </AuthProvider>
  );
}

export default App;
