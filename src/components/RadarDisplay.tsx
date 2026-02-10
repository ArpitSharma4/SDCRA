import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import * as satellite from 'satellite.js';

interface RadarDisplayProps {
  userLat: number;
  userLon: number;
  showDebris?: boolean;
  showActive?: boolean;
  showStarlink?: boolean;
  onVisibleSatellites?: (sats: VisibleSatellite[]) => void;
  className?: string;
}

interface VisibleSatellite {
  name: string;
  azimuth: number;
  elevation: number;
  range: number;
  type: 'debris' | 'active' | 'starlink';
  tailAzDelta?: number; // delta azimuth over 30s (for comet tail)
  tailElDelta?: number; // delta elevation over 30s
  showLabel?: boolean; // ISS, HST, etc.
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({
  userLat,
  userLon,
  showDebris = true,
  showActive = true,
  showStarlink = true,
  onVisibleSatellites,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [visibleSatellites, setVisibleSatellites] = useState<VisibleSatellite[]>([]);
  const [size, setSize] = useState(600);

  // Fetch satellite data
  const activeData = useSatelliteData('active');
  const starlinkData = useSatelliteData('starlink');
  const stationsData = useSatelliteData('stations');
  const debris1999Data = useSatelliteData('1999-025');
  const iridiumDebrisData = useSatelliteData('iridium-33-debris');

  // Merge all satellite data
  const allSatellites = useMemo(() => {
    const merged = new Map();
    
    if (showActive && activeData.satellites.size > 0 && !activeData.isLoading) {
      activeData.satellites.forEach((sat, id) => {
        merged.set(`active-${id}`, { ...sat, type: 'active' });
      });
    }
    
    if (showStarlink && starlinkData.satellites.size > 0 && !starlinkData.isLoading) {
      starlinkData.satellites.forEach((sat, id) => {
        merged.set(`starlink-${id}`, { ...sat, type: 'starlink' });
      });
    }
    
    if (showActive && stationsData.satellites.size > 0 && !stationsData.isLoading) {
      stationsData.satellites.forEach((sat, id) => {
        merged.set(`station-${id}`, { ...sat, type: 'active' });
      });
    }
    
    if (showDebris) {
      if (debris1999Data.satellites.size > 0 && !debris1999Data.isLoading) {
        debris1999Data.satellites.forEach((sat, id) => {
          merged.set(`debris1999-${id}`, { ...sat, type: 'debris' });
        });
      }
      
      if (iridiumDebrisData.satellites.size > 0 && !iridiumDebrisData.isLoading) {
        iridiumDebrisData.satellites.forEach((sat, id) => {
          merged.set(`iridium-${id}`, { ...sat, type: 'debris' });
        });
      }
    }
    
    return merged;
  }, [showDebris, showActive, showStarlink, activeData, starlinkData, stationsData, debris1999Data, iridiumDebrisData]);

  // Calculate visible satellites (with tail direction from velocity over 30s)
  const calculateVisibleSatellites = useMemo(() => {
    const visible: VisibleSatellite[] = [];
    const now = new Date();
    const later = new Date(now.getTime() + 30 * 1000);
    const gmstNow = satellite.gstime(now);
    const gmstLater = satellite.gstime(later);
    const observerGd = {
      latitude: userLat,
      longitude: userLon,
      height: 0.05
    };

    const isLabeled = (name: string) => {
      const u = (name || '').toUpperCase();
      return u.includes('ISS') || u.includes('ZARYA') || u.includes('HST') || u.includes('HUBBLE');
    };

    allSatellites.forEach((sat) => {
      try {
        if (sat.tle1 && sat.tle2) {
          const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
          const posNow = satellite.propagate(satrec, now);
          const posLater = satellite.propagate(satrec, later);

          if (posNow.position && posLater.position) {
            const ecfNow = satellite.eciToEcf(posNow.position, gmstNow);
            const ecfLater = satellite.eciToEcf(posLater.position, gmstLater);
            const lookNow = satellite.ecfToLookAngles(observerGd, ecfNow);
            const lookLater = satellite.ecfToLookAngles(observerGd, ecfLater);

            if (lookNow.elevation >= 0) {
              const azDeg = (lookNow.azimuth * 180) / Math.PI;
              const elDeg = (lookNow.elevation * 180) / Math.PI;
              const range = Math.sqrt(
                ecfNow.x * ecfNow.x + ecfNow.y * ecfNow.y + ecfNow.z * ecfNow.z
              );
              const tailAzDelta = ((lookLater.azimuth - lookNow.azimuth) * 180) / Math.PI;
              const tailElDelta = ((lookLater.elevation - lookNow.elevation) * 180) / Math.PI;

              visible.push({
                name: sat.name || 'Unknown',
                azimuth: azDeg,
                elevation: elDeg,
                range,
                type: sat.type,
                tailAzDelta,
                tailElDelta,
                showLabel: isLabeled(sat.name || ''),
              });
            }
          }
        }
      } catch {
        // Skip satellites with calculation errors
      }
    });

    return visible.sort((a, b) => b.elevation - a.elevation);
  }, [allSatellites, userLat, userLon]);

  // Update visible satellites every second
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSatellites(calculateVisibleSatellites);
    }, 1000);

    setVisibleSatellites(calculateVisibleSatellites);
    return () => clearInterval(interval);
  }, [calculateVisibleSatellites]);

  // Notify parent of visible satellites
  useEffect(() => {
    onVisibleSatellites?.(visibleSatellites);
  }, [visibleSatellites, onVisibleSatellites]);

  // Responsive canvas size from container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      setSize(Math.min(w, h) || 600);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Radar rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 10;

    const toXY = (azDeg: number, elDeg: number) => {
      const azimuthRad = (azDeg - 90) * (Math.PI / 180);
      const dist = ((90 - elDeg) / 90) * maxRadius;
      return {
        x: centerX + Math.cos(azimuthRad) * dist,
        y: centerY + Math.sin(azimuthRad) * dist,
      };
    };

    const render = () => {
      // Sky dome background: radial gradient (lighter at zenith, darker at horizon)
      const bgGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 1.2
      );
      bgGradient.addColorStop(0, '#1e293b');   // zenith
      bgGradient.addColorStop(0.6, '#0f172a'); // mid
      bgGradient.addColorStop(1, '#020617');   // horizon
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Static sky grid: thin white lines, opacity 0.1
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.1;

      // Concentric circles (elevation: 30°, 60°, 90°)
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 3) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Azimuth spokes (every 30°)
      for (let a = 0; a < 360; a += 30) {
        const rad = (a - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(rad) * maxRadius,
          centerY + Math.sin(rad) * maxRadius
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Satellites: white/cyan glowing dots with optional comet tails
      visibleSatellites.forEach((sat) => {
        const { x, y } = toXY(sat.azimuth, sat.elevation);

        const isCyan = sat.type === 'active' || sat.type === 'starlink';
        const fillColor = sat.type === 'debris' ? '#f87171' : isCyan ? '#22d3ee' : '#ffffff';
        const glowColor = sat.type === 'debris'
          ? 'rgba(248, 113, 113, 0.5)'
          : isCyan
            ? 'rgba(34, 211, 238, 0.6)'
            : 'rgba(255, 255, 255, 0.5)';

        // Comet tail (short line in direction of motion)
        if (sat.tailAzDelta != null && sat.tailElDelta != null && (sat.tailAzDelta !== 0 || sat.tailElDelta !== 0)) {
          const tailEnd = toXY(sat.azimuth + sat.tailAzDelta * 0.5, sat.elevation + sat.tailElDelta * 0.5);
          const dx = tailEnd.x - x;
          const dy = tailEnd.y - y;
          const len = Math.hypot(dx, dy) || 1;
          const tailLen = 18;
          const tx = x + (dx / len) * tailLen;
          const ty = y + (dy / len) * tailLen;
          const tailGradient = ctx.createLinearGradient(x, y, tx, ty);
          tailGradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)');
          tailGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          ctx.strokeStyle = tailGradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }

        // Glow + dot
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Labels for important objects (ISS, HST)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      visibleSatellites.forEach((sat) => {
        if (!sat.showLabel) return;
        const { x, y } = toXY(sat.azimuth, sat.elevation);
        const label = sat.name.includes('ISS') || sat.name.includes('ZARYA') ? 'ISS' : sat.name.includes('HST') || sat.name.includes('HUBBLE') ? 'HST' : sat.name;
        ctx.fillText(label, x, y + 8);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visibleSatellites, size]);

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-0 flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="bg-transparent block"
        style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: '1' }}
      />
      
      {/* Cardinal directions - clean sans-serif on edge */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-white/80 text-xs font-sans tracking-wider">N</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/80 text-xs font-sans tracking-wider">S</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-white/80 text-xs font-sans tracking-wider">W</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-white/80 text-xs font-sans tracking-wider">E</div>
    </div>
  );
};
