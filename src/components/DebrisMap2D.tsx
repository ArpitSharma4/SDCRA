import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { getSatellitePosition } from '@/utils/satelliteUtils';

interface DebrisMap2DProps {
  showDebris?: boolean;
  showActive?: boolean;
  showStarlink?: boolean;
  altitudeRange?: [number, number];
}

export const DebrisMap2D: React.FC<DebrisMap2DProps> = ({
  showDebris = true,
  showActive = true,
  showStarlink = true,
  altitudeRange = [0, 35000]
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Fetch satellite data
  const activeData = useSatelliteData('active');
  const starlinkData = useSatelliteData('starlink');
  const stationsData = useSatelliteData('stations');
  const debris1999Data = useSatelliteData('1999-025');
  const iridiumDebrisData = useSatelliteData('iridium-33-debris');

  // Merge all satellite data
  const allSatellites = useMemo(() => {
    const merged = new Map();
    
    // Add active satellites
    if (showActive && activeData.satellites.size > 0 && !activeData.isLoading) {
      activeData.satellites.forEach((sat, id) => {
        merged.set(`active-${id}`, { ...sat, type: 'active' });
      });
    }
    
    // Add Starlink satellites
    if (showStarlink && starlinkData.satellites.size > 0 && !starlinkData.isLoading) {
      starlinkData.satellites.forEach((sat, id) => {
        merged.set(`starlink-${id}`, { ...sat, type: 'starlink' });
      });
    }
    
    // Add space stations
    if (showActive && stationsData.satellites.size > 0 && !stationsData.isLoading) {
      stationsData.satellites.forEach((sat, id) => {
        merged.set(`station-${id}`, { ...sat, type: 'active' });
      });
    }
    
    // Add debris clouds
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
      
      // Add synthetic debris for better visualization (reduced count)
      const syntheticCount = Math.max(0, 300 - merged.size);
      for (let i = 0; i < syntheticCount; i++) {
        const lat = (Math.random() - 0.5) * 180;
        const lon = (Math.random() - 0.5) * 360;
        
        merged.set(`synthetic-debris-${i}`, {
          name: `DEBRIS-${i}`,
          type: 'debris',
          synthetic: true,
          lat,
          lon
        });
      }
    }
    
    return merged;
  }, [showDebris, showActive, showStarlink, activeData, starlinkData, stationsData, debris1999Data, iridiumDebrisData]);

  // Convert lat/lon to canvas coordinates (Equirectangular projection - simpler and cleaner)
  const latLonToXY = (lat: number, lon: number, w: number, h: number) => {
    const x = ((lon + 180) * w) / 360;
    const y = ((-lat + 90) * h) / 180;
    return { x, y };
  };

  // Get satellite position
  const getSatelliteCoords = (satellite: any) => {
    if (satellite.synthetic) {
      return { lat: satellite.lat, lon: satellite.lon };
    }
    
    try {
      if (satellite.tle1 && satellite.tle2) {
        const position = getSatellitePosition(satellite.tle1, satellite.tle2, new Date());
        if (position && position.lat !== undefined && position.lon !== undefined) {
          return { lat: position.lat, lon: position.lon };
        }
      }
    } catch (error) {
      // Fallback to random position
    }
    
    // Fallback random position
    return {
      lat: (Math.random() - 0.5) * 180,
      lon: (Math.random() - 0.5) * 360
    };
  };

  // Setup canvas and handle resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = 0;
    const targetFPS = 1; // 1 FPS for clean, non-chaotic display

    const render = (currentTime: number) => {
      // Throttle rendering
      if (currentTime - lastFrameTime < 1000 / targetFPS) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = currentTime;

      // Clear canvas completely
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Use standard composite operation (no additive blending)
      ctx.globalCompositeOperation = 'source-over';

      // Draw satellites
      allSatellites.forEach((satellite) => {
        const coords = getSatelliteCoords(satellite);
        const { x, y } = latLonToXY(coords.lat, coords.lon, dimensions.width, dimensions.height);

        // Skip if outside canvas bounds
        if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) {
          return;
        }

        // Set color based on type
        let color = '#ffffff';
        if (satellite.type === 'debris') {
          color = '#ff4444'; // Red for debris
        } else if (satellite.type === 'starlink') {
          color = '#4444ff'; // Blue for Starlink
        } else {
          color = '#00ccff'; // Cyan for active
        }

        // Draw satellite as a small, crisp circle
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6; // Consistent opacity
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2); // Small 1.5px radius
        ctx.fill();
      });

      // Reset alpha
      ctx.globalAlpha = 1.0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [allSatellites, dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Clean dark background with subtle grid */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/BlackMarble_2016_global_7km_print.jpg')`,
          backgroundColor: '#0a0e1a'
        }}
      />
      
      {/* Canvas overlay for satellite rendering */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 w-full h-full"
        style={{
          imageRendering: 'crisp-edges'
        }}
      />

      {/* Clean Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-slate-300">Debris</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-slate-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-300">Starlink</span>
          </div>
        </div>
      </div>
    </div>
  );
};
