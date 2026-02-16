import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo, useCallback, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navigation } from "@/components/Navigation";
import { trackPageView } from "@/lib/analytics";
import { KesslerTerminal } from "@/components/ui/KesslerTerminal";

// Lazy load pages to reduce initial bundle size
const OrbitRiskPage = lazy(() => import("./pages/OrbitRiskPage"));
const AboutPage = lazy(() => import("./pages/Manifest"));
const ReentryWatchPage = lazy(() => import("./pages/ReentryWatchPage"));
const SatcatPage = lazy(() => import("./pages/SatcatPage"));
const Contact = lazy(() => import("./pages/Contact"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage"));

const queryClient = new QueryClient();

// Wrapper component to handle navigation globally
const AppWithNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = useCallback((section: string) => {
    // Track page views
    trackPageView(section);
    
    if (section === 'home') {
      navigate('/');
    } else if (section === 'problem') {
      navigate('/orbit-risk');
    } else if (section === 'reentry') {
      navigate('/reentry-watch');
    } else if (section === 'manifest') {
      navigate('/manifest');
    } else {
      navigate(`#${section}`);
    }
  }, [navigate]);
  
  // Determine active section based on current path
  const activeSection = useMemo(() => {
    if (location.pathname === '/orbit-risk') return 'problem';
    if (location.pathname === '/reentry-watch') return 'reentry';
    if (location.pathname === '/manifest') return 'manifest';
    return (location.hash.replace('#', '') || 'home') as any;
  }, [location.pathname, location.hash]);

  // Determine if navigation should be hidden on current page
  const hideNavigation = useMemo(() => {
    return location.pathname === '/satcat' || location.pathname === '/documentation';
  }, [location.pathname]);

  // Send a pageview beacon on route changes (owner analytics only).
  useEffect(() => {
    const path = location.pathname + location.search + location.hash;
    trackPageView(path);
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      {!hideNavigation && <Navigation onNavigate={handleNavigation} activeSection={activeSection} />}
      <main className="flex-grow flex flex-col" style={{ minHeight: 0 }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orbit-risk" element={<OrbitRiskPage />} />
            <Route path="/manifest" element={<AboutPage />} />
            <Route path="/reentry-watch" element={<ReentryWatchPage />} />
            <Route path="/satcat" element={<SatcatPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
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
        <Analytics />
        <AppWithNavigation />
        <KesslerTerminal />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
