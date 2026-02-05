import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OrbitalHUDProps {
  satelliteName?: string;
  dataSource?: 'LIVE' | 'OFFLINE' | 'ERROR';
  mode?: string; // Add mode prop for different display modes
}

export const OrbitalHUD: React.FC<OrbitalHUDProps> = ({ 
  satelliteName = 'ORBITAL_01', 
  dataSource = 'LIVE',
  mode
}) => {
  const [latLon, setLatLon] = useState('--.-- / --.--');
  const [systemOnline, setSystemOnline] = useState(true);

  // Simulate random lat/lon updates
  useEffect(() => {
    const interval = setInterval(() => {
      const lat = (Math.random() * 180 - 90).toFixed(2);
      const lon = (Math.random() * 360 - 180).toFixed(2);
      setLatLon(`${lat} / ${lon}`);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Get status configuration based on dataSource
  const getStatusConfig = () => {
    switch (dataSource) {
      case 'LIVE':
        return {
          text: 'SYSTEM: ONLINE',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-500/70',
          blinking: true
        };
      case 'OFFLINE':
        return {
          text: 'SYSTEM: OFFLINE',
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-500/70',
          blinking: false
        };
      case 'ERROR':
        return {
          text: 'SYSTEM: ERROR',
          dotColor: 'bg-red-500',
          textColor: 'text-red-500/70',
          blinking: false
        };
      default:
        return {
          text: 'SYSTEM: ONLINE',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-500/70',
          blinking: true
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4">
        <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-12 h-12">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-cyan-500/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-cyan-500/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-cyan-500/50"></div>
        </div>
      </div>

      {/* Status Indicators */}
      {/* Top-Left: Dynamic System Status or Mode */}
      <div className="absolute top-6 left-16 font-mono text-xs flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span 
            className={`absolute inline-flex rounded-full h-2 w-2 ${statusConfig.dotColor}`}
          ></span>
          {statusConfig.blinking && (
            <span className="animate-ping absolute inline-flex rounded-full h-2 w-2 bg-emerald-500 opacity-75"></span>
          )}
        </span>
        <span className={statusConfig.textColor}>
          {mode ? `MODE: ${mode}` : statusConfig.text}
        </span>
      </div>

      {/* Top-Right: TGT: ORBITAL_01 */}
      <div className="absolute top-6 right-16 font-mono text-xs text-cyan-500/70">
        TGT: {satelliteName}
      </div>

      {/* Orbit Legend */}
      <div className="absolute bottom-16 left-16 font-mono text-xs text-cyan-500/60 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-px bg-cyan-400"></div>
          <span>Blue: Sat 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-px bg-amber-500"></div>
          <span>Orange: Sat 2</span>
        </div>
      </div>

      {/* Bottom-Left: LAT/LON */}
      <div className="absolute bottom-6 left-16 font-mono text-xs text-cyan-500/70">
        LAT/LON: {latLon}
      </div>

      {/* Bottom-Right: FOV */}
      <div className="absolute bottom-6 right-16 font-mono text-xs text-cyan-500/70">
        FOV: 120°
      </div>

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: ['100%', '-100%'] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
      </motion.div>

      {/* Additional HUD Elements */}
      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full grid grid-cols-8 grid-rows-8 opacity-5">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-cyan-500/20"></div>
          ))}
        </div>
      </div>

      {/* Distance Markers */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 font-mono text-xs text-cyan-500/40">
        <div className="space-y-4">
          <div>10km</div>
          <div>50km</div>
          <div>100km</div>
        </div>
      </div>

      <div className="absolute top-1/2 right-8 transform -translate-y-1/2 font-mono text-xs text-cyan-500/40">
        <div className="space-y-4">
          <div>10km</div>
          <div>50km</div>
          <div>100km</div>
        </div>
      </div>

      {/* Altitude Indicator */}
      <div className="absolute left-1/2 top-8 transform -translate-x-1/2 font-mono text-xs text-cyan-500/60 text-center">
        <div>ALT: 408km</div>
        <div className="text-xs text-cyan-500/40">ISS ORBIT</div>
      </div>
    </div>
  );
};
