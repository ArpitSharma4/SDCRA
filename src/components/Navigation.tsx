import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Section = 'home' | 'problem' | 'manifest' | 'reentry' | 'features';

interface NavigationProps {
  onNavigate: (section: Section) => void;
  activeSection: Section;
  brandName?: string;
}

const navItems = [
  { label: 'Home', section: 'home' as const },
  { label: 'Orbit Risk', section: 'problem' as const },
  { label: 'Reentry Watch', section: 'reentry' as const },
  { label: 'Manifest', section: 'manifest' as const },
];

export function Navigation({ onNavigate, activeSection, brandName = "SDCRA" }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. ADVANCED SCROLL DETECTION (Fixes "Wrapper" Bug)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      let scrollValue = window.scrollY;

      // If a specific div is scrolling (not the window), grab its scroll value
      if (e.target instanceof HTMLElement && (e.target as HTMLElement).scrollTop > 0) {
        scrollValue = (e.target as HTMLElement).scrollTop;
      }

      setIsScrolled(scrollValue > 20);
    };

    // { capture: true } is magic. It listens to ALL scroll events on the page.
    window.addEventListener('scroll', handleScroll, { capture: true });
    
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-slate-100/10 backdrop-blur-xl border-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.05)]' // MUCH LIGHTER GLASS
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group bg-transparent border-none p-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Satellite className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">{brandName}</span>
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => onNavigate(item.section)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative px-4 py-2 text-sm font-medium transition-colors group bg-transparent border-none cursor-pointer ${
                  activeSection === item.section 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
                <span 
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                    activeSection === item.section ? 'w-3/4' : 'w-0 group-hover:w-3/4'
                  }`} 
                />
              </motion.button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              variant="default" 
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.section);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                    activeSection === item.section 
                      ? 'bg-accent/20 text-foreground' 
                      : 'text-foreground/80 hover:bg-accent/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 px-4">
                <Button className="w-full bg-primary text-primary-foreground">
                  Launch App
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default Navigation;
