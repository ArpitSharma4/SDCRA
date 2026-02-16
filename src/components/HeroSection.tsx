import { motion } from 'framer-motion';
import { ArrowRight, Telescope, Sun, Moon, Github, Twitter, Linkedin, Mail, Satellite, Database, FileText } from 'lucide-react';
import { Earth3D } from './Earth3D';
import { TypewriterTitle } from './TypewriterTitle';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import IdentityScanner from './hero/IdentityScanner';

type Section = 'home' | 'problem' | 'how-it-works' | 'features' | 'manifest';

interface HeroSectionProps {
  onNavigate?: (section: Section) => void;
}

const footerLinks = {
  Product: [
    { label: 'Orbit Risk Checker', href: '/orbit-risk' },
    { label: 'SATCAT Registry', href: '/satcat' },
    { label: 'Reentry Watch', href: '/reentry-watch' },
  ],
  Resources: [
    { label: 'Documentation', href: '/documentation' },
    { label: 'TLE Database', href: '/satcat' },
    { label: 'Research Papers', href: '#' },
    { label: 'FAQ', href: '/faq' },
  ],
  Company: [
    { label: 'About Us', href: '/manifest' },
    { label: 'Contact', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Github, href: 'https://github.com/ArpitSharma4', label: 'GitHub' },
  { icon: Twitter, href: 'https://x.com/sharmaarpit05?s=11', label: 'Twitter' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/arpit-sharma-76b2b2238/', label: 'LinkedIn' },
];

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [isNightMode, setIsNightMode] = useState(false);
  
  return (
    <section id="home" className="relative min-h-fit flex flex-col overflow-hidden bg-background">
      {/* 3D Earth Background - Positioned higher */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <div className="absolute -top-[36rem] left-0 right-0 bottom-0">
            <Earth3D isNightMode={isNightMode} />
            
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/80 via-background/10 to-background/80" />
          <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-background/5 via-transparent to-transparent" />
        </div>
      </div>
      

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/80 via-background/10 to-background/80" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-background/5 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl min-h-[500px] flex flex-col justify-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Real-time orbital tracking active
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <div className="min-h-[280px] flex flex-col justify-center">
              <TypewriterTitle 
                lines={[
                  'SPACE DEBRIS',
                  'COLLISION RISK', 
                  'ANALYSER'
                ]}
                speed={50}
              />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-10"
          >
            Turning orbital data into collision-free futures.
          </motion.p>

          {/* CTA Section with Identity Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-6 mt-8"
          >
            <IdentityScanner />
            
            <p className="text-slate-500 text-xs font-mono">
              * DATA PERSISTS FOR SESSION DURATION ONLY. NO CLOUD STORAGE.
            </p>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>

      {/* Footer Content */}
      <div className="relative z-20 mt-auto pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Disclaimer Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-12 max-w-4xl mx-auto"
          >
            <div>
              <h3 className="font-semibold text-foreground mb-1">DISCLAIMER</h3>
              <p className="text-sm text-muted-foreground">
                This tool provides estimates based on available orbital data. Actual collision risks may vary. 
                For mission-critical decisions, please consult with orbital safety experts.
              </p>
            </div>
          </motion.div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Satellite className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SDCRA
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Providing advanced analytics for space situational awareness and collision risk assessment to ensure the sustainable use of Earth's orbital environment.
              </p>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 order-2 md:order-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground order-1 md:order-2 text-center md:text-right">
              © {new Date().getFullYear()} SDCRA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
