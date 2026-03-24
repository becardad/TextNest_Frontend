import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import ScreenLock from "./components/ScreenLock";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for token verification before rendering
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Sonner position="top-center" richColors />
            <MemoryRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/chat" element={<ProtectedRoute><ScreenLock><ChatPage /></ScreenLock></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
