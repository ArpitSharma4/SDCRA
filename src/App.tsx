import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo, useCallback } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navigation } from "@/components/Navigation";

// Lazy load the OrbitRiskPage and HeatmapPage to reduce initial bundle size
const OrbitRiskPage = lazy(() => import("./pages/OrbitRiskPage").then(module => ({ default: module.OrbitRiskPage })));
const HeatmapPage = lazy(() => import("./pages/HeatmapPage").then(module => ({ default: module.default })));

const queryClient = new QueryClient();

// Wrapper component to handle navigation globally
const AppWithNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = useCallback((section: string) => {
    if (section === 'home') {
      navigate('/');
    } else if (section === 'problem') {
      navigate('/orbit-risk');
    } else if (section === 'heatmap') {
      navigate('/heatmap');
    } else {
      navigate(`#${section}`);
    }
  }, [navigate]);
  
  // Determine active section based on current path
  const activeSection = useMemo(() => {
    if (location.pathname === '/orbit-risk') return 'problem';
    if (location.pathname === '/heatmap') return 'heatmap';
    return (location.hash.replace('#', '') || 'home') as any;
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <Navigation onNavigate={handleNavigation} activeSection={activeSection} />
      <main className="flex-grow flex flex-col">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orbit-risk" element={<OrbitRiskPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWithNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
