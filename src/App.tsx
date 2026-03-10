import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hustles from "./pages/Hustles";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import ResumeStudio from "./pages/ResumeStudio";
import CompanyDashboard from "./pages/CompanyDashboard";
import HustlePortal from "./pages/HustlePortal";
import HowItWorks from "./pages/HowItWorks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hustles" element={<Hustles />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/resume" element={<ResumeStudio />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/hustle-portal/:hustleId" element={<HustlePortal />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
