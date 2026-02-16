import React, { useEffect, useRef, useState } from "react";
import { generateOrbitPath, getSatellitePosition } from "@/utils/satelliteUtils";

interface ReentryMapProps {
  tle1: string;
  tle2: string;
  satelliteName?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

interface TrackPoint {
  lat: number;
  lon: number;
}

interface MarkerPosition {
  x: number;
  y: number;
}

const formatLat = (lat: number): string => {
  const hemi = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(1)}° ${hemi}`;
};

const formatLon = (lon: number): string => {
  const hemi = lon >= 0 ? "E" : "W";
  return `${Math.abs(lon).toFixed(1)}° ${hemi}`;
};

export const ReentryMap: React.FC<ReentryMapProps> = ({ tle1, tle2, satelliteName }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 400 });
  const [track, setTrack] = useState<TrackPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<TrackPoint | null>(null);
  const [markerPos, setMarkerPos] = useState<MarkerPosition | null>(null);

  // Equirectangular projection
  const latLonToXY = (lat: number, lon: number, w: number, h: number) => {
    const x = ((lon + 180) * w) / 360;
    const y = ((-lat + 90) * h) / 180;
    return { x, y };
  };

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 400;

      setDimensions({
        width: Math.max(640, width),
        height: Math.max(320, height),
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      ro.disconnect();
    };
  }, []);

  // Compute track: now -> +90 minutes, sampled every minute
  useEffect(() => {
    if (!tle1 || !tle2) {
      setTrack([]);
      setCurrentPoint(null);
      setMarkerPos(null);
      return;
    }

    try {
      // Reuse orbit path util with 1.5 hours and 1-minute steps
      const path = generateOrbitPath(tle1, tle2, 1.5, 1);
      const filtered = path
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
        .map((p) => ({ lat: p.lat, lon: p.lon }));

      setTrack(filtered);

      const pos = getSatellitePosition(tle1, tle2, new Date());
      const head = pos && pos.lat !== undefined && pos.lon !== undefined
        ? { lat: pos.lat, lon: pos.lon }
        : filtered[0] ?? null;

      setCurrentPoint(head);
    } catch {
      setTrack([]);
      setCurrentPoint(null);
      setMarkerPos(null);
    }
  }, [tle1, tle2]);

  // Draw map + track and update marker position in pixels
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;

    // Background: night lights map + dark overlay
    ctx.clearRect(0, 0, width, height);

    const draw = () => {
      // Base fill
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      // Simple grid for lat/lon awareness
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);

      // Meridians every 60°
      for (let lon = -180; lon <= 180; lon += 60) {
        const { x } = latLonToXY(0, lon, width, height);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Parallels every 30°
      for (let lat = -60; lat <= 60; lat += 30) {
        const { y } = latLonToXY(lat, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // Ground track line
      if (track.length > 1) {
        ctx.strokeStyle = "rgba(248, 113, 113, 0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        track.forEach((p, idx) => {
          const { x, y } = latLonToXY(p.lat, p.lon, width, height);
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Faint trail glow
        ctx.strokeStyle = "rgba(248, 113, 113, 0.35)";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        track.forEach((p, idx) => {
          const { x, y } = latLonToXY(p.lat, p.lon, width, height);
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Current position marker (canvas glow)
      if (currentPoint) {
        const { x, y } = latLonToXY(currentPoint.lat, currentPoint.lon, width, height);

        // Glow
        const radial = ctx.createRadialGradient(x, y, 0, x, y, 14);
        radial.addColorStop(0, "rgba(248,113,113,0.9)");
        radial.addColorStop(1, "rgba(15,23,42,0)");
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = "#f97373";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = "#fecaca";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.stroke();

        setMarkerPos({ x, y });
      } else {
        setMarkerPos(null);
      }
    };

    draw();
  }, [dimensions, track, currentPoint]);

  const currentLocationLabel =
    currentPoint != null ? `${formatLat(currentPoint.lat)}, ${formatLon(currentPoint.lon)}` : "—";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[260px] rounded-md overflow-hidden bg-slate-950 border border-slate-800"
    >
      {/* World map background (NASA Black Marble - tactical mission control styling) */}
      <div
        className="absolute inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url('https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'grayscale(100%) contrast(1.2) brightness(0.6)'
        }}
      />

      {/* Subtle grid overlay behind chart line */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="relative z-10 w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* Pulsing target icon at current location (HTML overlay) */}
      {markerPos && dimensions.width > 0 && dimensions.height > 0 && (
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: `${(markerPos.x / dimensions.width) * 100}%`,
            top: `${(markerPos.y / dimensions.height) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-500/40 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full border border-red-300 bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
          </div>
        </div>
      )}

      {/* X-axis label */}
      <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 z-10 text-[10px] text-slate-300 uppercase tracking-[0.2em]">
        Longitude
      </div>

      {/* Y-axis label */}
      <div className="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 -rotate-90 origin-left z-10 text-[10px] text-slate-300 uppercase tracking-[0.2em]">
        Latitude
      </div>

      {/* Current location label */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 rounded px-2 py-1 bg-slate-950/80 border border-slate-700/80 text-[10px] text-slate-200 uppercase tracking-[0.2em]">
        CURRENT LOCATION:{" "}
        <span className="ml-1 normal-case tracking-normal text-slate-100">
          {currentLocationLabel}
        </span>
      </div>

      {/* Time window legend */}
      <div className="pointer-events-none absolute bottom-4 left-3 z-20 rounded px-2 py-1 bg-slate-950/70 border border-slate-700/80 text-[10px] text-slate-300 uppercase tracking-[0.2em]">
        Next ~90 minutes // 60s samples
      </div>

      {/* Object name */}
      {satelliteName && (
        <div className="pointer-events-none absolute bottom-4 right-3 z-20 rounded px-2 py-1 bg-slate-950/70 border border-slate-700/80 text-[10px] text-slate-300 truncate max-w-[50%]">
          {satelliteName}
        </div>
      )}
    </div>
  );
};

export default ReentryMap;

